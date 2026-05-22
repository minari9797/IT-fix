# 🛠️ IT-Fix : Plateforme de Support Informatique (Extranet)

> **IT-Fix** est une application moderne de gestion de tickets de support informatique, conçue pour transformer le support technique traditionnel en une expérience fluide et instantanée grâce à l'architecture Cloud Serverless.

---

## 🗺️ Architecture de Données (SGBD Cloud)

Le système repose sur un schéma relationnel rigoureux implémenté sur **PostgreSQL (Supabase)**, optimisé pour la séparation des rôles :

- **Table A (Utilisateurs)** : `profiles` — Gère les employés qui soumettent les incidents.
- **Table B (Techniciens)** : `technicians` — Gère l'équipe support et leurs spécialités.
- **Table C (Interactions)** : `tickets` — La table de liaison gérant le cycle de vie du support (Status, Priorité, IDs).
- **Storage (Fichiers)** : `screenshots` — Bucket de stockage pour les données non-structurées (Preuves de bugs).

---

## 🏗️ Analyse d'Architecture Cloud

### 💰 Optimisation Financière : OPEX vs CAPEX
Contrairement aux infrastructures classiques demandant un investissement massif en matériel (**CAPEX**), IT-Fix adopte un modèle **OPEX**. 
- **Investissement initial :** 0 DZD.
- **Coûts :** Basés uniquement sur la consommation réelle via le Serverless (Vercel/Supabase).

### 📈 Scalabilité Logicielle
Finies les contraintes de climatisation ou de racks physiques des Data Centers locaux. Grâce à la virtualisation de **Vercel**, la puissance de calcul s'adapte dynamiquement aux pics de charge de manière logicielle et instantanée.

### 📂 Gestion de l'Information
- **Données Structurées :** Organisées en schémas SQL précis (Utilisateurs, Tickets).
- **Données Non-structurées :** Fichiers binaires (Images/PDF) isolés dans des **Buckets de stockage** pour optimiser les performances de la base de données.

---

## ⚡ Philosophie "Vibe Coding"
Ce projet a été développé en mode **"Build & Ship"** rapide :
1. **Prototype instantané** : Utilisation de Next.js pour un rendu SSR ultra-rapide.
2. **Backend-as-a-Service** : Supabase gère l'authentification et le RLS (Row Level Security) nativement.
3. **CI/CD** : Chaque `git push` déclenche un déploiement automatique sur Vercel.

---

## 👥 L'Équipe
*   **Elissa Bennacer**
*   **Imene Bouchareb**
*   **Yasmine Khaled** 
*   **Maria Remmache**
  
   
   

---
*Projet réalisé dans le cadre du module Système d'Information - 2CP1 -ESTIN 2026*
