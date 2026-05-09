package edu.cit.olimba.vaulttech.User;

import edu.cit.olimba.vaulttech.Email.EmailService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;


@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;
    private final UserRepository userRepository;
    private final EmailService emailService;

    public UserController(UserService userService,
                          UserRepository userRepository,
                          EmailService emailService) {
        this.userService = userService;
        this.userRepository = userRepository;
        this.emailService = emailService;
    }


    @PostMapping("/register")
    public ResponseEntity<String> register(@RequestBody UserEntity user) {
        String result = userService.registerUser(user);
        if (result.toLowerCase().contains("fail") || result.toLowerCase().contains("already exists")) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(result);
        }
        return ResponseEntity.ok(result);
    }


    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> body) {
        String email    = body.get("email");
        String password = body.get("password");

        if (email == null || password == null) {
            return ResponseEntity.badRequest().body("Email and password are required.");
        }

        Map<String, String> result = userService.loginUser(email, password);

        if (result == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("Invalid email or password.");
        }

        return ResponseEntity.ok(result);
    }


    @GetMapping("/{username}")
    public ResponseEntity<?> getUserProfile(@PathVariable String username) {
        Optional<UserEntity> userOpt = userRepository.findByUsername(username);
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found.");
        }
        UserEntity user = userOpt.get();
        user.setPassword(null);
        return ResponseEntity.ok(user);
    }

    @PostMapping("/{username}/trusted-contacts/add")
    public ResponseEntity<?> addTrustedContact(@PathVariable String username,
                                               @RequestBody Map<String, String> body) {
        Optional<UserEntity> userOpt = userRepository.findByUsername(username);
        if (userOpt.isEmpty()) return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found.");

        UserEntity user = userOpt.get();
        String newContact = body.get("contact").trim();

        if (user.getTrustedContacts().contains(newContact)) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Contact already exists.");
        }

        if (newContact.contains("@")) {
            user.getTrustedContacts().add(newContact);
            userRepository.save(user);
            try {
                emailService.sendInheritorNotification(newContact, username);
            } catch (Exception e) {
                return ResponseEntity.status(HttpStatus.CREATED)
                        .body("Contact added, but failed to send email. Check SMTP settings.");
            }
            return ResponseEntity.ok("Email contact added and notified.");
        } else {
            Optional<UserEntity> existingUser = userRepository.findByUsername(newContact);
            if (existingUser.isEmpty()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body("Username does not exist in Vault-Tech.");
            }
            user.getTrustedContacts().add(newContact);
            userRepository.save(user);
            return ResponseEntity.ok("Vault-Tech user added as trusted contact.");
        }
    }

    @DeleteMapping("/{username}/trusted-contacts/{contact}")
    public ResponseEntity<?> removeTrustedContact(@PathVariable String username,
                                                  @PathVariable String contact) {
        Optional<UserEntity> userOpt = userRepository.findByUsername(username);
        if (userOpt.isEmpty()) return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found.");

        UserEntity user = userOpt.get();
        user.getTrustedContacts().remove(contact);
        userRepository.save(user);
        return ResponseEntity.ok("Contact removed.");
    }
}