package com.example.vault_tech.API

import okhttp3.ResponseBody
import retrofit2.Response
import retrofit2.http.Body
import retrofit2.http.Field
import retrofit2.http.FormUrlEncoded
import retrofit2.http.POST

interface AuthApiService {

    @POST("/api/users/register")
    suspend fun register(
        @Body user: UserRequest
    ): Response<ResponseBody> // Changed to raw ResponseBody

    @FormUrlEncoded
    @POST("/api/users/login")
    suspend fun login(
        @Field("email") email: String,
        @Field("password") password: String
    ): Response<ResponseBody> // Changed to raw ResponseBody
}