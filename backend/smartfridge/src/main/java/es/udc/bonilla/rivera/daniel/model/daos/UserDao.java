package es.udc.bonilla.rivera.daniel.model.daos;

import org.springframework.data.jpa.repository.JpaRepository;

import es.udc.bonilla.rivera.daniel.model.entities.User;

public interface UserDao extends JpaRepository<User, Long> {

    boolean existsByUserName(String userName);

    boolean existsByEmail(String email);

}
