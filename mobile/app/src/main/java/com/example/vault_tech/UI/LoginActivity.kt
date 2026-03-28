package com.example.vault_tech.UI

import android.content.Intent
import android.os.Bundle
import android.text.SpannableString
import android.text.Spanned
import android.text.TextPaint
import android.text.method.LinkMovementMethod
import android.text.style.ClickableSpan
import android.text.style.ForegroundColorSpan
import android.text.style.UnderlineSpan
import android.view.View
import android.widget.Button
import android.widget.EditText
import android.widget.TextView
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.core.content.ContextCompat
import androidx.lifecycle.lifecycleScope
import com.example.vault_tech.R
import com.example.vault_tech.API.ApiClient

import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext

class LoginActivity : AppCompatActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_login)

        val btnLogin = findViewById<Button>(R.id.btn_login)
        val tvRegisterLink = findViewById<TextView>(R.id.tv_register_link)
        val etEmail = findViewById<EditText>(R.id.et_email)
        val etPassword = findViewById<EditText>(R.id.et_password)

        setupRegisterLink(tvRegisterLink)

        btnLogin.setOnClickListener {
            val email = etEmail.text.toString().trim()
            val password = etPassword.text.toString().trim()

            // 1. Basic Validation
            if (email.isEmpty() || password.isEmpty()) {
                Toast.makeText(this, "Please enter email and password", Toast.LENGTH_SHORT).show()
                return@setOnClickListener
            }

            lifecycleScope.launch(Dispatchers.IO) {
                try {
                    val response = ApiClient.authService.login(email, password)

                    withContext(Dispatchers.Main) {
                        if (response.isSuccessful) {
                            val serverMessage = response.body()?.string() ?: ""

                            if (serverMessage.contains("Success")) {
                                Toast.makeText(this@LoginActivity, "Log in successful!", Toast.LENGTH_LONG).show()

                                // TODO: Navigate to the Dashboard/Home screen here!

                            } else if (serverMessage.contains("not found")) {
                                Toast.makeText(this@LoginActivity, "User not registered", Toast.LENGTH_LONG).show()
                            } else {
                                Toast.makeText(this@LoginActivity, serverMessage, Toast.LENGTH_LONG).show()
                            }

                        } else {
                            Toast.makeText(this@LoginActivity, "Server Error: ${response.code()}", Toast.LENGTH_LONG).show()
                        }
                    }
                } catch (e: Exception) {
                    withContext(Dispatchers.Main) {
                        Toast.makeText(this@LoginActivity, "Crash: ${e.message}", Toast.LENGTH_LONG).show()
                    }
                }
            }
        }
    }

    private fun setupRegisterLink(tvLink: TextView) {
        val fullText = "Don't have an account? [Register]"
        val spannableString = SpannableString(fullText)

        val registerPart = "[Register]"
        val start = fullText.indexOf(registerPart)
        val end = start + registerPart.length

        val clickableSpan = object : ClickableSpan() {
            override fun onClick(widget: View) {
                val intent = Intent(this@LoginActivity, RegisterActivity::class.java)
                startActivity(intent)
            }

            override fun updateDrawState(ds: TextPaint) {
                super.updateDrawState(ds)
                ds.color = ContextCompat.getColor(this@LoginActivity, android.R.color.black)
                ds.isUnderlineText = true
            }
        }

        spannableString.setSpan(clickableSpan, start, end, Spanned.SPAN_EXCLUSIVE_EXCLUSIVE)
        spannableString.setSpan(UnderlineSpan(), start, end, Spanned.SPAN_EXCLUSIVE_EXCLUSIVE)
        spannableString.setSpan(ForegroundColorSpan(ContextCompat.getColor(this, android.R.color.black)), start, end, Spanned.SPAN_EXCLUSIVE_EXCLUSIVE)

        tvLink.text = spannableString
        tvLink.movementMethod = LinkMovementMethod.getInstance()
    }
}