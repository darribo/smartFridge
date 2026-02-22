package es.udc.bonilla.rivera.daniel.rest.controllers;

import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestAttribute;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import es.udc.bonilla.rivera.daniel.model.common.DuplicateInstanceException;
import es.udc.bonilla.rivera.daniel.model.common.InstanceNotFoundException;
import es.udc.bonilla.rivera.daniel.model.common.PermissionException;
import es.udc.bonilla.rivera.daniel.model.entities.Household;
import es.udc.bonilla.rivera.daniel.model.entities.User;
import es.udc.bonilla.rivera.daniel.model.entities.UserHousehold;
import es.udc.bonilla.rivera.daniel.model.services.Block;
import es.udc.bonilla.rivera.daniel.model.services.HouseholdService;
import es.udc.bonilla.rivera.daniel.rest.common.ErrorsDto;
import es.udc.bonilla.rivera.daniel.rest.dtos.BlockDto;
import es.udc.bonilla.rivera.daniel.rest.dtos.ChangeAdminParamsDto;
import es.udc.bonilla.rivera.daniel.rest.dtos.HouseholdConversor;
import es.udc.bonilla.rivera.daniel.rest.dtos.HouseholdDto;
import es.udc.bonilla.rivera.daniel.rest.dtos.HouseholdUserDto;
import es.udc.bonilla.rivera.daniel.rest.dtos.NewHouseholdParamsDto;
import es.udc.bonilla.rivera.daniel.rest.dtos.UserHouseholdConversor;
import es.udc.bonilla.rivera.daniel.rest.dtos.UserHouseholdDto;
import es.udc.bonilla.rivera.daniel.rest.dtos.UserHouseholdListDto;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;


@Tag(
    name = "Hogares",
    description = "Operaciones relacionadas con hogares, invitaciones y membresías."
)
@RestController
@RequestMapping("/households")
public class HouseholdController {

    private static final int USER_HOUSEHOLDS_SIZE = 3;
    private static final int HOUSEHOLD_USER_AVATARS_SIZE = 3;
    private static final int HOUSEHOLD_PENDING_INVITATIONS_SIZE = 3;


    @Autowired
    private HouseholdService householdService;

    @Operation(
        summary = "Crear un hogar",
        description = "Crea un nuevo hogar para el usuario autenticado como administrador."
    )
    @ApiResponses({
        @ApiResponse(responseCode = "201", description = "Hogar creado",
            content = @Content(schema = @Schema(implementation = HouseholdDto.class))),
        @ApiResponse(responseCode = "404", description = "Usuario no encontrado",
            content = @Content(schema = @Schema(implementation = ErrorsDto.class))),
        @ApiResponse(responseCode = "400", description = "Nombre de hogar duplicado",
            content = @Content(schema = @Schema(implementation = ErrorsDto.class)))
    })
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public HouseholdDto createHousehold(@RequestAttribute Long userId, @Validated @RequestBody NewHouseholdParamsDto params) throws InstanceNotFoundException, DuplicateInstanceException {
        
        Household household = householdService.createHousehold(userId, params.getName(), params.getDescription(), params.getCountryCode(), params.getRegionCode(), params.getRegionName());

        return HouseholdConversor.toHouseholdDto(household);
    }

    @GetMapping("/{householdId}")
    public HouseholdDto getHousehold(@RequestAttribute Long userId, @PathVariable Long householdId) throws InstanceNotFoundException {
        return HouseholdConversor.toHouseholdDto(householdService.getHousehold(userId, householdId));
    }
    

    @Operation(
        summary = "Actualizar un hogar",
        description = "Actualiza los datos de un hogar existente si el usuario autenticado es su administrador."
    )
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Hogar actualizado",
            content = @Content(schema = @Schema(implementation = HouseholdDto.class))),
        @ApiResponse(responseCode = "404", description = "Usuario u hogar no encontrado",
            content = @Content(schema = @Schema(implementation = ErrorsDto.class))),
        @ApiResponse(responseCode = "400", description = "Nombre de hogar duplicado",
            content = @Content(schema = @Schema(implementation = ErrorsDto.class))),
        @ApiResponse(responseCode = "403", description = "Sin permisos para actualizar el hogar",
            content = @Content(schema = @Schema(implementation = ErrorsDto.class)))
    })
    @PutMapping("/{householdId}")
    public HouseholdDto updateHousehold(@RequestAttribute Long userId, @PathVariable Long householdId, @Validated @RequestBody NewHouseholdParamsDto params) throws InstanceNotFoundException, DuplicateInstanceException, PermissionException {
        
        Household household = householdService.updateHousehold(householdId, userId, params.getName(), params.getDescription(), params.getCountryCode(), params.getRegionCode(), params.getRegionName());

        return HouseholdConversor.toHouseholdDto(household);
    }


    @DeleteMapping("/{householdId}/removeMember/{memberId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void removeHouseholdMember(@RequestAttribute Long userId, @PathVariable Long householdId, @PathVariable Long memberId) throws InstanceNotFoundException, PermissionException {
        householdService.removeHouseholdMember(userId, memberId, householdId);
    }

    @Operation(
        summary = "Cambiar administrador del hogar",
        description = "Asigna un nuevo administrador a un hogar existente. El nuevo administrador debe pertenecer previamente al hogar."
    )
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Administrador actualizado",
            content = @Content(schema = @Schema(implementation = HouseholdDto.class))),
        @ApiResponse(responseCode = "404", description = "Usuario, hogar o relación usuario-hogar no encontrada",
            content = @Content(schema = @Schema(implementation = ErrorsDto.class))),
        @ApiResponse(responseCode = "403", description = "Sin permisos para cambiar el administrador",
            content = @Content(schema = @Schema(implementation = ErrorsDto.class)))
    })
    @PostMapping("/{householdId}/newAdmin")
    public HouseholdDto changeAdmin(@RequestAttribute Long userId, @PathVariable Long householdId, @Validated @RequestBody ChangeAdminParamsDto params) throws InstanceNotFoundException, PermissionException {
        
        Household household = householdService.changeAdmin(userId, params.getNewAdminId(), householdId);

        return HouseholdConversor.toHouseholdDto(household);
    }

    @Operation(
        summary = "Eliminar un hogar",
        description = "Elimina un hogar si el usuario autenticado es su administrador."
    )
    @ApiResponses({
        @ApiResponse(responseCode = "204", description = "Hogar eliminado"),
        @ApiResponse(responseCode = "404", description = "Usuario u hogar no encontrado",
            content = @Content(schema = @Schema(implementation = ErrorsDto.class))),
        @ApiResponse(responseCode = "403", description = "Sin permisos para eliminar el hogar",
            content = @Content(schema = @Schema(implementation = ErrorsDto.class)))
    })
    @DeleteMapping("/{householdId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void removeHousehold(@RequestAttribute Long userId, @PathVariable Long householdId) throws InstanceNotFoundException, PermissionException {
        householdService.removeHousehold(userId, householdId);
    }

    /* @Operation(
        summary = "Enviar invitación a un hogar",
        description = "Envía una invitación para que otro usuario se una a un hogar administrado por el usuario autenticado."
    )
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Invitación enviada",
            content = @Content(schema = @Schema(implementation = HouseholdInvitationDto.class))),
        @ApiResponse(responseCode = "404", description = "Usuario u hogar no encontrado",
            content = @Content(schema = @Schema(implementation = ErrorsDto.class))),
        @ApiResponse(responseCode = "400", description = "Invitación duplicada",
            content = @Content(schema = @Schema(implementation = ErrorsDto.class))),
        @ApiResponse(responseCode = "403", description = "Sin permisos para invitar",
            content = @Content(schema = @Schema(implementation = ErrorsDto.class)))
    })
    @PostMapping("/{householdId}/invite")
    public HouseholdInvitationDto sendHouseholdInvitation(@RequestAttribute Long userId, @PathVariable Long householdId, @Validated @RequestBody SendHouseholdInvitationParamsDto params) throws InstanceNotFoundException, DuplicateInstanceException, PermissionException {
        
        HouseholdInvitation invitation = householdService.sendHouseholdInvitation(userId, params.getGuestId(), householdId);

        return HouseholdInvitationConversor.toHouseholdInvitationDto(invitation);
    } */

    /* @Operation(
        summary = "Aceptar invitación",
        description = "Acepta una invitación pendiente al hogar del usuario autenticado."
    )
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Invitación aceptada",
            content = @Content(schema = @Schema(implementation = UserHouseholdDto.class))),
        @ApiResponse(responseCode = "404", description = "Invitación no encontrada o no válida",
            content = @Content(schema = @Schema(implementation = ErrorsDto.class))),
        @ApiResponse(responseCode = "400", description = "El usuario ya pertenece al hogar",
            content = @Content(schema = @Schema(implementation = ErrorsDto.class)))
    })
    @PostMapping("/invitations/{householdInvitationId}/accept")
    public UserHouseholdDto acceptInvitation(@RequestAttribute Long userId, @PathVariable Long householdInvitationId) throws InstanceNotFoundException, DuplicateInstanceException {
        
        UserHousehold userHousehold = householdService.acceptInvitation(userId, householdInvitationId);
        
        return UserHouseholdConversor.toUserHouseholdDto(userHousehold);
    } */

    /* @Operation(
        summary = "Rechazar invitación",
        description = "Rechaza una invitación pendiente al hogar del usuario autenticado."
    )
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Invitación rechazada",
            content = @Content(schema = @Schema(implementation = HouseholdInvitationDto.class))),
        @ApiResponse(responseCode = "404", description = "Invitación no encontrada o no válida",
            content = @Content(schema = @Schema(implementation = ErrorsDto.class)))
    })
    @PostMapping("/invitations/{householdInvitationId}/reject")
    public HouseholdInvitationDto rejectInvitation(@RequestAttribute Long userId, @PathVariable Long householdInvitationId) throws InstanceNotFoundException {
        
        HouseholdInvitation householdInvitation = householdService.rejectInvitation(userId, householdInvitationId);
        
        return HouseholdInvitationConversor.toHouseholdInvitationDto(householdInvitation);
    } */

    @Operation(
        summary = "Obtener pertenencia usuario-hogar",
        description = "Recupera la relación de pertenencia entre el usuario autenticado y un hogar."
    )
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Relación usuario-hogar encontrada",
            content = @Content(schema = @Schema(implementation = UserHouseholdDto.class))),
        @ApiResponse(responseCode = "404", description = "Relación usuario-hogar no encontrada",
            content = @Content(schema = @Schema(implementation = ErrorsDto.class)))
    })
    
    @GetMapping("/userHouseholds/{userHouseholdId}")
    public UserHouseholdDto getUserHousehold(@RequestAttribute Long userId, @PathVariable Long userHouseholdId) throws InstanceNotFoundException {
        
        UserHousehold userHousehold = householdService.getUserHousehold(userId, userHouseholdId);

        return UserHouseholdConversor.toUserHouseholdDto(userHousehold);
    }

    @Operation(
        summary = "Abandonar un hogar",
        description = "Elimina la pertenencia del usuario autenticado en el hogar. Si era administrador, se reasigna o se elimina el hogar."
    )
    @ApiResponses({
        @ApiResponse(responseCode = "204", description = "Usuario eliminado del hogar"),
        @ApiResponse(responseCode = "404", description = "Usuario, hogar o relación no encontrada",
            content = @Content(schema = @Schema(implementation = ErrorsDto.class)))
    })
    @DeleteMapping("/{householdId}/leave")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void leaveHousehold(@RequestAttribute Long userId, @PathVariable Long householdId) throws InstanceNotFoundException {
    
        householdService.leaveHousehold(userId, householdId);
    }

    @Operation(
        summary = "Listar hogares del usuario",
        description = "Recupera de forma paginada los hogares del usuario autenticado junto con número de miembros y avatares."
    )
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Lista de hogares recuperada",
            content = @Content(schema = @Schema(implementation = UserHouseholdListDto.class))),
        @ApiResponse(responseCode = "404", description = "Usuario o membresía no encontrada",
            content = @Content(schema = @Schema(implementation = ErrorsDto.class)))
    })
    @GetMapping("/userHouseholds")
    public BlockDto<UserHouseholdListDto> getUserHouseholds(@RequestAttribute Long userId, @RequestParam(defaultValue = "0") int page) throws InstanceNotFoundException {

        //Hogares del usuario en objeto block
        Block<Household> block = householdService.getUserHouseholds(userId, page, USER_HOUSEHOLDS_SIZE);

        //Lista de hogares sacada del objeto block
        List<Household> userHouseholds = block.getItems();

        //Lista en formato de hogar + número de miembros + sus avatares para devolver
        List<UserHouseholdListDto> list = new ArrayList<>();

        for (Household household : userHouseholds){

            //Número de miembros del hogar
            int householdMembers = householdService.getHouseholdMembersNumber(userId, household.getId());

            //Usuarios que pertenecen al hogar
            Block<User> householdUsers = householdService.getHouseholdMembers(userId, household.getId(), 0, HOUSEHOLD_USER_AVATARS_SIZE);

            //Avatares de los usuarios
            List<String> usersAvatars = householdUsers.getItems()
                                        .stream()
                                        .map(User::getAvatar)
                                        .toList();

            list.add(HouseholdConversor.toUserHouseholdListDto(household, householdMembers, usersAvatars, householdUsers.getExistMoreItems()));
        }

        return new BlockDto<>(list, block.getExistMoreItems());
    }

    @Operation(
        summary = "Listar miembros de un hogar",
        description = "Recupera de forma paginada los miembros de un hogar al que pertenece el usuario autenticado."
    )
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Miembros del hogar recuperados",
            content = @Content(schema = @Schema(implementation = HouseholdUserDto.class))),
        @ApiResponse(responseCode = "404", description = "Hogar o membresía no encontrada",
            content = @Content(schema = @Schema(implementation = ErrorsDto.class)))
    })
    @GetMapping("/{householdId}/users")
    public BlockDto<HouseholdUserDto> getHouseholdMembers(@RequestAttribute Long userId, @PathVariable Long householdId, @RequestParam(defaultValue="0") int page) throws InstanceNotFoundException {
        
        Household household = householdService.getHousehold(userId, householdId);
        Block<User> householdUsers = householdService.getHouseholdMembers(userId, householdId, page, HOUSEHOLD_USER_AVATARS_SIZE);

        return new BlockDto<>(HouseholdConversor.toHouseholdUserDtos(householdUsers.getItems(), household.getAdmin().getId()), householdUsers.getExistMoreItems());
    }

    /* @GetMapping("/{householdId}/pendingInvitations")
    public BlockDto<HouseholdInvitationDto> getPendingInvitations(@RequestAttribute Long userId, @PathVariable Long householdId, @RequestParam(defaultValue="0") int page) throws InstanceNotFoundException {
        
        Block<HouseholdInvitation> invitations = householdService.getHouseholdPendingInvitations(userId, householdId, page, HOUSEHOLD_PENDING_INVITATIONS_SIZE);
        
        return new BlockDto<>(HouseholdInvitationConversor.toHouseholdInvitationDtos(invitations.getItems()), invitations.getExistMoreItems());
    } */
    
    

}
