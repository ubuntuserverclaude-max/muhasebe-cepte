# Muhasebe Cepte - Alt Ajan Rolleri

Bu dosya, `~/muhasebe-cepte-clone/app-src` projesinde görev yapan otonom alt ajanların rollerini tanımlar.

## 1. Analiz Ajanı (`Analiz`)
- **Görevi:** Proje kaynak kodlarını, `package.json` bağımlılıklarını ve Logo İşbaşı saha iş akışlarını karşılaştırarak eksik özellikleri tespit eder.
- **Kapsam:** Statik kod analizi, mimari uyumluluk ve geliştirme yol haritası çıkarma.

## 2. Expo / WatermelonDB Geliştirici Ajanı (`Expo-WatermelonDB-Dev`)
- **Görevi:** React Native / Expo SDK 58 ve WatermelonDB offline-first veritabanı mimarisinde bileşenleri geliştirir, offline senkronizasyon mantığını kurar.
- **Kapsam:** `src/`, `app/` dizinleri, Supabase RLS entegrasyonu ve state yönetimi.

## 3. Test ve Build Ajanı (`Test-Build`)
- **Görevi:** TypeScript derleme hatalarını (`tsc --noEmit`), `expo-doctor` kontrollerini ve Expo EAS bulut build işlemlerini yönetir.
- **Kapsam:** CI/CD, EAS cloud build tetikleme ve hata raporlama.
