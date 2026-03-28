package com.example.vault_tech.UI

import android.content.Intent
import android.os.Bundle
import android.widget.Button
import android.widget.EditText
import android.widget.TextView
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import com.example.vault_tech.R
import com.example.vault_tech.API.ApiClient
import com.example.vault_tech.API.UserRequest
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext

class RegisterActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_register)

        val etFName = findViewById<EditText>(R.id.etFName)
        val etLName = findViewById<EditText>(R.id.etLName)
        val etEmail = findViewById<EditText>(R.id.etRegisterEmail)
        val etPassword = findViewById<EditText>(R.id.etRegisterPassword)
        val etConfirmPassword = findViewById<EditText>(R.id.etConfirmPassword)
        val btnRegister = findViewById<Button>(R.id.btnRegister)
        val tvLoginLink = findViewById<TextView>(R.id.tvLoginLink)

        btnRegister.setOnClickListener {
            val fname = etFName.text.toString().trim()
            val lname = etLName.text.toString().trim()
            val email = etEmail.text.toString().trim()
            val password = etPassword.text.toString().trim()
            val confirmPassword = etConfirmPassword.text.toString().trim()

            // 1. Validate Inputs
            if (fname.isEmpty() || lname.isEmpty() || email.isEmpty() || password.isEmpty() || confirmPassword.isEmpty()) {
                Toast.makeText(this, "Please fill all fields", Toast.LENGTH_SHORT).show()
                return@setOnClickListener
            }

            if (password != confirmPassword) {
                Toast.makeText(this, "Passwords do not match", Toast.LENGTH_SHORT).show()
                return@setOnClickListener
            }

            val userRequest = UserRequest(fname, lname, email, password)

            lifecycleScope.launch(Dispatchers.IO) {
                try {
                    val response = ApiClient.authService.register(userRequest)

                    withContext(Dispatchers.Main) {
                        if (response.isSuccessful) {
                            val serverMessage = response.body()?.string() ?: ""

                            Toast.makeText(this@RegisterActivity, serverMessage, Toast.LENGTH_LONG).show()

                            finish()
                        } else {
                            Toast.makeText(this@RegisterActivity, "Server Error: ${response.code()}", Toast.LENGTH_LONG).show()
                        }
                    }
                } catch (e: Exception) {
                    withContext(Dispatchers.Main) {
                        Toast.makeText(this@RegisterActivity, "Crash: ${e.message}", Toast.LENGTH_LONG).show()
                    }
                }
            }
        }

        tvLoginLink.setOnClickListener {
            finish()
        }
    }
}