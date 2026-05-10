package edu.cit.olimba.vaulttech.Vault;

import edu.cit.olimba.vaulttech.Security.JwtUtil;
import edu.cit.olimba.vaulttech.User.UserRepository;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(VaultController.class)
@AutoConfigureMockMvc(addFilters = false)
public class VaultControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private VaultService vaultService;

    @MockitoBean
    private UserRepository userRepository;

    @MockitoBean
    private JwtUtil jwtUtil;

    @Test
    void getActiveVaultsSuccess() throws Exception {
        Mockito.when(vaultService.getActiveVaults("testuser"))
                .thenReturn(List.of(new VaultEntity()));

        mockMvc.perform(get("/api/vaults")
                        .param("username", "testuser"))
                .andExpect(status().isOk());
    }

    @Test
    void TC_VAULT_01_createVaultSuccess() throws Exception {
        String requestBody = "{\"name\":\"My Vault\", \"ownerUsername\":\"testuser\", \"vaultPassword\":\"secure123\"}";

        Mockito.when(vaultService.createVault(
                        Mockito.anyString(), Mockito.any(), Mockito.anyString(),
                        Mockito.anyString(), Mockito.anyString(), Mockito.anyString()))
                .thenReturn(new VaultEntity());

        mockMvc.perform(post("/api/vaults")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestBody))
                .andExpect(status().isCreated());
    }

    @Test
    void TC_VAULT_02_verifyPasswordSuccess() throws Exception {
        String requestBody = "{\"username\":\"testuser\", \"password\":\"secure123\"}";

        Mockito.when(vaultService.verifyVaultPassword(1L, "testuser", "secure123"))
                .thenReturn(true);

        mockMvc.perform(post("/api/vaults/1/verify")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestBody))
                .andExpect(status().isOk());
    }

    @Test
    void TC_VAULT_03_manualTriggerSuccess() throws Exception {
        String requestBody = "{\"username\":\"testuser\"}";

        Mockito.doNothing().when(vaultService).manualTriggerVault(1L, "testuser");

        mockMvc.perform(post("/api/vaults/1/trigger")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestBody))
                .andExpect(status().isOk());
    }
}