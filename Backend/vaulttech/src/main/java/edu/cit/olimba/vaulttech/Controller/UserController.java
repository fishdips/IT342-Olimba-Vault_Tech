package edu.cit.olimba.vaulttech.Controller;

import edu.cit.olimba.vaulttech.Entity.UserEntity;
import edu.cit.olimba.vaulttech.Service.UserService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "*")
public class UserController {

    @Autowired
    private UserService userService;

    @PostMapping("/register")
    public ResponseEntity<String> register(@RequestBody UserEntity user){
        String result = userService.registerUser(user);

        if (result.toLowerCase().contains("fail") || result.toLowerCase().contains("already exists")) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(result);
        }

        return ResponseEntity.ok(result);
    }

    @PostMapping("/login")
    public ResponseEntity<String> login(@RequestParam String email,
                                        @RequestParam String password){

        String result = userService.loginUser(email, password);

        if (result.equalsIgnoreCase("Invalid credentials") ||
                result.equalsIgnoreCase("User not found") ||
                result.toLowerCase().contains("fail")) {

            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(result);
        }

        return ResponseEntity.ok(result);
    }
}