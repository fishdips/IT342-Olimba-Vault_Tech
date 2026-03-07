package edu.cit.olimba.vaulttech.Controller;

import edu.cit.olimba.vaulttech.Entity.UserEntity;
import edu.cit.olimba.vaulttech.Service.UserService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@CrossOrigin
public class UserController {

    @Autowired
    private UserService userService;

    // REGISTER
    @PostMapping("/register")
    public String register(@RequestBody UserEntity user){
        return userService.registerUser(user);
    }

    // LOGIN
    @PostMapping("/login")
    public String login(@RequestParam String email,
                        @RequestParam String password){

        return userService.loginUser(email, password);
    }
}