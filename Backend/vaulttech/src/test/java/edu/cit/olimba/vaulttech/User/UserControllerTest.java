package edu.cit.olimba.vaulttech.User;

import edu.cit.olimba.vaulttech.Email.EmailService;
import edu.cit.olimba.vaulttech.Security.JwtUtil;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Map;
import java.util.Optional;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(UserController.class)
@AutoConfigureMockMvc(addFilters = false)
public class UserControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private UserService userService;

    @MockitoBean
    private UserRepository userRepository;

    @MockitoBean
    private EmailService emailService;

    @MockitoBean
    private JwtUtil jwtUtil;

    @Test
    void loginSuccess() throws Exception {
        Mockito.when(userService.loginUser("fishdips11@gmail.com", "password123"))
                .thenReturn(Map.of("token", "mock-jwt-token", "username", "testuser"));

        String requestBody = "{\"email\":\"fishdips11@gmail.com\", \"password\":\"password123\"}";

        mockMvc.perform(post("/api/users/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestBody))
                .andExpect(status().isOk());
    }

    @Test
    void loginInvalid() throws Exception {
        Mockito.when(userService.loginUser("fishdips11@gmail.com", "wrongpass"))
                .thenReturn(null);

        String requestBody = "{\"email\":\"fishdips11@gmail.com\", \"password\":\"wrongpass\"}";

        mockMvc.perform(post("/api/users/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestBody))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void registerSuccess() throws Exception {
        Mockito.when(userService.registerUser(Mockito.any(UserEntity.class)))
                .thenReturn("User registered successfully.");

        String requestBody = "{\"username\":\"newuser\", \"email\":\"fishdips11@gmail.com\", \"password\":\"password123\", \"firstName\":\"John\", \"lastName\":\"Doe\"}";

        mockMvc.perform(post("/api/users/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestBody))
                .andExpect(status().isOk());
    }

    @Test
    void addContactSuccess() throws Exception {
        UserEntity mockUser = new UserEntity("testuser", "fishdips11@gmail.com", "pass", "John", "Doe");
        Mockito.when(userRepository.findByUsername("testuser"))
                .thenReturn(Optional.of(mockUser));

        String requestBody = "{\"contact\":\"olimbajayz789@gmail.com\"}";

        mockMvc.perform(post("/api/users/testuser/trusted-contacts/add")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestBody))
                .andExpect(status().isOk());
    }

    @Test
    void removeContactSuccess() throws Exception {
        UserEntity mockUser = new UserEntity("testuser", "fishdips11@gmail.com", "pass", "John", "Doe");
        mockUser.getTrustedContacts().add("olimbajayz789@gmail.com");
        Mockito.when(userRepository.findByUsername("testuser"))
                .thenReturn(Optional.of(mockUser));

        mockMvc.perform(delete("/api/users/testuser/trusted-contacts/olimbajayz789@gmail.com"))
                .andExpect(status().isOk());
    }
}