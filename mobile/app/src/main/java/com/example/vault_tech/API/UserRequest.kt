package com.example.vault_tech.API

data class UserRequest(
    val firstName: String,
    val lastName: String,
    val email: String,
    val password: String,
)