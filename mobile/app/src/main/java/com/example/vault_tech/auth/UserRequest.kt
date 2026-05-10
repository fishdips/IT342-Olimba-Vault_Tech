package com.example.vault_tech.auth

data class UserRequest(
    val firstName: String,
    val lastName: String,
    val username: String,
    val email: String,
    val password: String
)