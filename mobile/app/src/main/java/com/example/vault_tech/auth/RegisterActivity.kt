package com.example.vault_tech.auth

import android.os.Bundle
import android.widget.EditText
import android.widget.TextView
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.appcompat.widget.AppCompatButton
import androidx.lifecycle.lifecycleScope
import com.example.vault_tech.R
import com.example.vault_tech.core.network.ApiClient
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext

class RegisterActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_register)

        // 1. Link all UI elements, including the new username field
        val etFName = findViewById<EditText>(R.id.etFName)
        val etLName = findViewById<EditText>(R.id.etLName)
        val etUsername = findViewById<EditText>(R.id.etRegisterUsername)
        val etEmail = findViewById<EditText>(R.id.etRegisterEmail)
        val etPassword = findViewById<EditText>(R.id.etRegisterPassword)
        val etConfirmPassword = findViewById<EditText>(R.id.etConfirmPassword)
        val btnRegister = findViewById<AppCompatButton>(R.id.btnRegister)
        val tvLoginLink = findViewById<TextView>(R.id.tvLoginLink)

        btnRegister.setOnClickListener {
            val fname = etFName.text.toString().trim()
            val lname = etLName.text.toString().trim()
            val username = etUsername.text.toString().trim() // NOW THIS WORKS
            val email = etEmail.text.toString().trim()
            val password = etPassword.text.toString().trim()
            val confirmPassword = etConfirmPassword.text.toString().trim()

            // 2. Added 'username.isEmpty()' to the validation
            if (fname.isEmpty() || lname.isEmpty() || username.isEmpty() || email.isEmpty() || password.isEmpty() || confirmPassword.isEmpty()) {
                Toast.makeText(this, "Please fill all fields", Toast.LENGTH_SHORT).show()
                return@setOnClickListener
            }

            if (password != confirmPassword) {
                Toast.makeText(this, "Passwords do not match", Toast.LENGTH_SHORT).show()
                return@setOnClickListener
            }

            btnRegister.text = "CREATING ACCOUNT..."
            btnRegister.isEnabled = false

            val userRequest = UserRequest(fname, lname, username, email, password)

            lifecycleScope.launch(Dispatchers.IO) {
                try {
                    val response = ApiClient.authService.register(userRequest)

                    withContext(Dispatchers.Main) {
                        btnRegister.text = "CREATE ACCOUNT"
                        btnRegister.isEnabled = true

                        if (response.isSuccessful) {
                            val serverMessage = response.body()?.string() ?: ""
                            Toast.makeText(this@RegisterActivity, serverMessage, Toast.LENGTH_LONG).show()
                            finish()
                        } else {
                            Toast.makeText(this@RegisterActivity, "Registration Failed. Check details.", Toast.LENGTH_LONG).show()
                        }
                    }
                } catch (e: Exception) {
                    withContext(Dispatchers.Main) {
                        btnRegister.text = "CREATE ACCOUNT"
                        btnRegister.isEnabled = true
                        Toast.makeText(this@RegisterActivity, "Connection error. Please try again.", Toast.LENGTH_LONG).show()
                    }
                }
            }
        }

        tvLoginLink.setOnClickListener {
            finish()
        }
    }
}