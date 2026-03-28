package edu.cit.olimba.vaulttech.Service;

import edu.cit.olimba.vaulttech.Repository.UserRepository;

import edu.cit.olimba.vaulttech.Entity.UserEntity;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    private BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    public String registerUser(UserEntity user) {

        if(user.getFirstName() == null || user.getLastName() == null ||
                user.getEmail() == null || user.getPassword() == null){
            return "All fields are required.";
        }

        if(userRepository.existsByEmail(user.getEmail())){
            return "Email already exists.";
        }

        // HASH PASSWORD
        String hashedPassword = passwordEncoder.encode(user.getPassword());
        user.setPassword(hashedPassword);

        userRepository.save(user);

        return "User registered successfully.";
    }

    public String loginUser(String email, String password){

        Optional<UserEntity> userOptional = userRepository.findByEmail(email);

        if(userOptional.isEmpty()){
            return "Invalid email or password.";
        }

        UserEntity user = userOptional.get();

        if(!passwordEncoder.matches(password, user.getPassword())){
            return "Invalid email or password.";
        }

        return "Login successful.";
    }
}