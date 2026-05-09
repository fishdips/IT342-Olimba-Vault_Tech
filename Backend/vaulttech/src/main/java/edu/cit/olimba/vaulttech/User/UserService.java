package edu.cit.olimba.vaulttech.User;

import edu.cit.olimba.vaulttech.Security.JwtUtil;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.Map;
import java.util.Optional;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final BCryptPasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public UserService(UserRepository userRepository,
                       BCryptPasswordEncoder passwordEncoder,
                       JwtUtil jwtUtil) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
    }

    public String registerUser(UserEntity user) {
        if (user.getUsername() == null || user.getFirstName() == null ||
                user.getLastName() == null || user.getEmail() == null ||
                user.getPassword() == null) {
            return "All fields are required.";
        }
        if (userRepository.existsByUsername(user.getUsername())) {
            return "Username already exists.";
        }
        if (userRepository.existsByEmail(user.getEmail())) {
            return "Email already exists.";
        }
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        userRepository.save(user);
        return "User registered successfully.";
    }

    public Map<String, String> loginUser(String email, String password) {
        Optional<UserEntity> userOptional = userRepository.findByEmail(email);

        if (userOptional.isEmpty()) return null;

        UserEntity user = userOptional.get();

        if (!passwordEncoder.matches(password, user.getPassword())) return null;
        user.setLastActiveDate(LocalDate.now());
        userRepository.save(user);

        String token = jwtUtil.generateToken(user.getUsername());
        return Map.of("token", token, "username", user.getUsername());
    }
}