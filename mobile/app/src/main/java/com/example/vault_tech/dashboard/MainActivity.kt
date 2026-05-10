package com.example.vault_tech.dashboard

import android.content.Intent
import android.os.Bundle
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import androidx.security.crypto.EncryptedSharedPreferences
import androidx.security.crypto.MasterKey
import com.example.vault_tech.R
import com.example.vault_tech.auth.LoginActivity
import com.example.vault_tech.core.network.ApiClient
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext

class MainActivity : AppCompatActivity() {

    private lateinit var sharedPreferences: android.content.SharedPreferences
    private lateinit var adapter: VaultAdapter
    private val vaultList = mutableListOf<Vault>()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        initStorage()

        val token = sharedPreferences.getString("JWT_TOKEN", null)
        if (token == null) {
            navigateToLogin()
            return
        }

        val rvVaults = findViewById<RecyclerView>(R.id.rv_vaults)
        rvVaults.layoutManager = LinearLayoutManager(this)
        adapter = VaultAdapter(vaultList)
        rvVaults.adapter = adapter

        // Fetch actual data from backend
        fetchVaults("Bearer $token")
    }

    private fun fetchVaults(token: String) {
        lifecycleScope.launch(Dispatchers.IO) {
            try {
                val response = ApiClient.vaultService.getUserVaults(token)
                withContext(Dispatchers.Main) {
                    if (response.isSuccessful) {
                        val data = response.body() ?: emptyList()
                        vaultList.clear()
                        vaultList.addAll(data)
                        adapter.notifyDataSetChanged()
                    } else {
                        Toast.makeText(this@MainActivity, "Error: ${response.code()}", Toast.LENGTH_SHORT).show()
                    }
                }
            } catch (e: Exception) {
                withContext(Dispatchers.Main) {
                    Toast.makeText(this@MainActivity, "Connection Failed", Toast.LENGTH_SHORT).show()
                }
            }
        }
    }

    private fun initStorage() {
        val masterKey = MasterKey.Builder(this).setKeyScheme(MasterKey.KeyScheme.AES256_GCM).build()
        sharedPreferences = EncryptedSharedPreferences.create(
            this, "vault_secure_prefs", masterKey,
            EncryptedSharedPreferences.PrefKeyEncryptionScheme.AES256_SIV,
            EncryptedSharedPreferences.PrefValueEncryptionScheme.AES256_GCM
        )
    }

    private fun navigateToLogin() {
        startActivity(Intent(this, LoginActivity::class.java))
        finish()
    }
}