package com.example.backend.repository;

import com.example.backend.model.Cerradura;
import com.example.backend.model.Propiedad;
import com.example.backend.model.Propietario;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CerraduraRepository extends JpaRepository<Cerradura, String> {
    Cerradura findByPropiedad(Propiedad propiedad);
    List<Cerradura> findByPropietario(Propietario propietario);
    
}
