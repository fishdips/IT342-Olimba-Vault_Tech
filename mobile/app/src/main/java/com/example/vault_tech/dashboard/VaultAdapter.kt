package com.example.vault_tech.dashboard

import android.graphics.Color
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.ProgressBar
import android.widget.TextView
import androidx.recyclerview.widget.RecyclerView
import com.example.vault_tech.R

class VaultAdapter(private val vaults: List<Vault>) : RecyclerView.Adapter<VaultAdapter.VaultViewHolder>() {

    class VaultViewHolder(view: View) : RecyclerView.ViewHolder(view) {
        val accentBar: View = view.findViewById(R.id.card_accent_bar)
        val tvName: TextView = view.findViewById(R.id.tv_vault_name)
        val tvDate: TextView = view.findViewById(R.id.tv_vault_date)
        val tvDays: TextView = view.findViewById(R.id.tv_days_remaining)
        val progressBar: ProgressBar = view.findViewById(R.id.pb_deadman)
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): VaultViewHolder {
        val view = LayoutInflater.from(parent.context)
            .inflate(R.layout.item_vault_card, parent, false)
        return VaultViewHolder(view)
    }

    override fun onBindViewHolder(holder: VaultViewHolder, position: Int) {
        val vault = vaults[position]

        holder.tvName.text = vault.name
        holder.tvDate.text = "Created: ${vault.createdDate}"
        holder.tvDays.text = "${vault.daysRemaining} Days"

        // Calculate progress percentage
        val progressPercent = if (vault.totalDays > 0) {
            ((vault.daysRemaining.toFloat() / vault.totalDays.toFloat()) * 100).toInt()
        } else 0

        holder.progressBar.progress = progressPercent

        // Optional: Change accent bar color if the user customized it
        try {
            holder.accentBar.setBackgroundColor(Color.parseColor(vault.colorHex))
        } catch (e: Exception) {
            // Fallback to default blue if hex is invalid
            holder.accentBar.setBackgroundColor(Color.parseColor("#0066b1"))
        }
    }

    override fun getItemCount() = vaults.size
}