package com.example.vault_tech.dashboard

import retrofit2.Response
import retrofit2.http.GET
import retrofit2.http.Header

interface VaultApiService {
    @GET("/api/vaults")
    suspend fun getUserVaults(
        @Header("Authorization") token: String
    ): Response<List<Vault>>
}