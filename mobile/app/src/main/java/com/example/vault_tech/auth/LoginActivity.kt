package com.example.vault_tech.auth

import android.content.Intent
import android.os.Bundle
import android.widget.EditText
import android.widget.TextView
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.appcompat.widget.AppCompatButton
import androidx.lifecycle.lifecycleScope
import androidx.security.crypto.EncryptedSharedPreferences
import androidx.security.crypto.MasterKey
import com.example.vault_tech.R
import com.example.vault_tech.core.network.ApiClient
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext

class LoginActivity : AppCompatActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_login)

        val btnLogin = findViewById<AppCompatButton>(R.id.btn_login)
        val tvRegisterLink = findViewById<TextView>(R.id.tv_register_link)
        val etEmail = findViewById<EditText>(R.id.et_email)
        val etPassword = findViewById<EditText>(R.id.et_password)

        tvRegisterLink.setOnClickListener {
            val intent = Intent(this@LoginActivity, RegisterActivity::class.java)
            startActivity(intent)
        }

        btnLogin.setOnClickListener {
            val email = etEmail.text.toString().trim()
            val password = etPassword.text.toString().trim()

            if (email.isEmpty() || password.isEmpty()) {
                Toast.makeText(this, "Please enter your email and password", Toast.LENGTH_SHORT).show()
                return@setOnClickListener
            }

            btnLogin.text = "SIGNING IN..."
            btnLogin.isEnabled = false

            lifecycleScope.launch(Dispatchers.IO) {
                try {
                    val response = ApiClient.authService.login(email, password)

                    withContext(Dispatchers.Main) {
                        btnLogin.text = "LOG IN"
                        btnLogin.isEnabled = true

                        if (response.isSuccessful) {
                            val serverMessage = response.body()?.string() ?: ""

                            if (serverMessage.contains("Success", ignoreCase = true) || serverMessage.contains("token", ignoreCase = true)) {

                                val masterKey = MasterKey.Builder(this@LoginActivity)
                                    .setKeyScheme(MasterKey.KeyScheme.AES256_GCM)
                                    .build()

                                val sharedPreferences = EncryptedSharedPreferences.create(
                                    this@LoginActivity,
                                    "vault_secure_prefs",
                                    masterKey,
                                    EncryptedSharedPreferences.PrefKeyEncryptionScheme.AES256_SIV,
                                    EncryptedSharedPreferences.PrefValueEncryptionScheme.AES256_GCM
                                )

                                sharedPreferences.edit().putString("JWT_TOKEN", serverMessage).apply()

                                Toast.makeText(this@LoginActivity, "Access Granted", Toast.LENGTH_SHORT).show()

                                val intent = Intent(this@LoginActivity, com.example.vault_tech.dashboard.MainActivity::class.java)
                                startActivity(intent)

                                finish()

                            } else if (serverMessage.contains("not found", ignoreCase = true)) {
                                Toast.makeText(this@LoginActivity, "User not registered.", Toast.LENGTH_LONG).show()
                            } else {
                                Toast.makeText(this@LoginActivity, serverMessage, Toast.LENGTH_LONG).show()
                            }

                        } else {
                            Toast.makeText(this@LoginActivity, "Authentication Failed. Check credentials.", Toast.LENGTH_LONG).show()
                        }
                    }
                } catch (e: Exception) {
                    withContext(Dispatchers.Main) {
                        btnLogin.text = "LOG IN"
                        btnLogin.isEnabled = true
                        Toast.makeText(this@LoginActivity, "Connection error. Please try again.", Toast.LENGTH_LONG).show()
                    }
                }
            }
        }
    }
}