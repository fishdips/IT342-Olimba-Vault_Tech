package com.example.vault_tech.dashboard

data class Vault(
    val id: String,
    val name: String,
    val createdDate: String,
    val totalDays: Int,
    val daysRemaining: Int,
    val colorHex: String = "#0066b1"
)