package com.example.vault_tech.core.network

import com.example.vault_tech.auth.AuthApiService
import com.example.vault_tech.dashboard.VaultApiService
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory

object ApiClient {
    private const val BASE_URL = "http://10.0.2.2:8080"

    private val retrofit: Retrofit by lazy {
        Retrofit.Builder()
            .baseUrl(BASE_URL)
            .addConverterFactory(GsonConverterFactory.create())
            .build()
    }

    val authService: AuthApiService by lazy {
        retrofit.create(AuthApiService::class.java)
    }

    val vaultService: VaultApiService by lazy {
        retrofit.create(VaultApiService::class.java)
    }
}