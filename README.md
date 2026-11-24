# Parti Odası – Müzik ve Film güncellemesi

## Render'da çalıştırma
1. Dosyaları GitHub reposuna yükle (index.html, server.js, package.json, data/ klasörü).
2. Render → New Web Service → repoyu seç. Build: `npm install`, Start: `npm start`.
3. **Film oyunu için:** themoviedb.org'da ücretsiz hesap aç → Settings → API → anahtar al.
   Render → Environment → `TMDB_API_KEY` = anahtarın (v3 anahtarı veya v4 "eyJ…" token).
   Anahtar önerilir; anahtar yoksa film oyunu Wikimedia Commons yedek kaynağını dener.
4. Sunucuda dışarıya çıkış (internet) açık olmalı (Render ücretsiz planda açık).

## Nasıl çalışıyor
- **Şarkı:** Sunucu, iTunes Search API'den (yedek: Deezer) şarkının resmî 30 sn önizlemesini bulur,
  rastgele bir kesit (seek) ve başlangıç zamanını (playAt) belirler; tüm telefonlar aynı anda çalar.
  Şarkı/sanatçı adı istemciye turun sonuna kadar gönderilmez.
- **Film:** Önce TMDB'den geniş arka plan kareleri aranır; sonuç alınamazsa Wikimedia Commons yedeği denenir. Bulunan kareler süre içinde sırayla açılır. Kare puanı: 100/80/60/40/20.
- Yönetici panelinden film eklerken en az 3 `https` görsel URL'si verilirse TMDB yerine onlar kullanılır.
- iOS Safari için ses kilidi ilk dokunuşta açılır; çalmazsa "Başlat" butonu çıkar.

## Bu sürümde değişenler
- Tur seçenekleri: 5, 10, 15, 20, 25, 30, 40, 50 ve Sınırsız (oda sahibi "Oyunu bitir" ile bitirir).
- İçerik havuzları `data/bonus-content.js` ile genişletildi; havuz bitince içerikler baştan, tekrarsız döngüyle gelir.
- Ortam değişkeni: `TMDB_API_KEY` (film kareleri için önerilir; Wikimedia yedeği anahtarsız da denenir). `PORT` Render tarafından verilir.

## Pikseli Aç, şarkı ve test (v3.1)
- **Pikseli Aç:** görseller çalışma anında İngilizce Vikipedi'den çözülür; yalnızca Wikimedia Commons (özgür lisanslı) görseller kabul edilir, her çözünürlük adımı sunucuda yüklenebiliyor mu diye doğrulanır, doğrulanamayan kayıt oyuna girmez. Havuzdaki kaç kaydın gerçekten çözüldüğünü görmek için sunucu açıkken `/pixel-check` adresini aç, birkaç dakika sonra `/pixel-stats` adresine bak (`ok`/`fail`).
- **Şarkı:** parça artık tur bitene kadar çalar (iTunes/Deezer önizlemesi en çok 30 sn).
- **Kategori seçimi:** soru oyunlarında ve Pikseli Aç'ta oda sahibi kategori seçebilir.
- **Gerçek Socket.IO testi:** `npm install && npm test` (8 istemci; sunucuyu kendisi başlatır).


## İçerik genişletmesi (2026-11)
- Soru ve kelime ekleri `data/content-expansion.js` dosyasından yüklenir.
- Film kataloğu `data/extra-content.js` içindedir; sahne kareleri önce TMDB backdrop API'sinden, sonuç alınamazsa Wikimedia Commons aramasından tur sırasında alınır.
- `TMDB_API_KEY` önerilir; anahtar olmadan da Wikimedia Commons yedeği denenir.
- İçerik kontrolü: `npm test` (Node.js 18+).
- Film havuzuna yeni kayıt eklerken İngilizce/orijinal ad ve doğru yapım yılını kullan; TMDB araması bunlarla yapılır.


## Medya düzeltmesi (2026-11)
- Şarkı havuzu 80+ parçaya çıkarıldı; iTunes araması TR/US kataloglarında farklı sorgularla denenir, ardından Deezer yedeği kullanılır.
- Film görseli çözümlemesi artık 3+ kare şartı aramaz. TMDB'den gelen tek bir uygun geniş sahne karesi bile turu oynatır; İngilizce, Türkçe ve metinsiz backdrop görselleri aranır.
- TMDB arama sonuçları film adı ve yılına göre puanlanır; başarısız istekler kısa süreli önbelleğe alınır ve hata durumu sunucuya kaydedilir.
- Dağıtım sonrası `https://SITEN-ADRESIN/media-status` adresinden `tmdbConfigured`, `musicCatalogCount`, `filmCatalogCount`, `filmSuccess`, `filmNoFrames` alanları kontrol edilebilir. Bu uç nokta API anahtarını hiçbir zaman göstermez.
- Film görseli URL'leri TMDB'nin resmi görsel CDN biçiminde oluşturulur. TMDB, görsel adresleri için güvenli temel URL, boyut ve dosya yolunun birleştirilmesini tarif eder: https://developer.themoviedb.org/docs/image-basics

## Yeni oyunlar ve Karma Mod güncellemesi

- Karma Mod artık **2–8 oyun** kabul eder. Seçili oyunlar tek tek kaldırılabilir; seçim sayısı 2'nin altındaysa başlatma sırasında uyarı verilir.
- Yeni oyunlar: **Wordle**, **Kelimelik**, **Bağdaştırıcı**, **Palavra**, **Yüz Kişiye Sorduk** ve **Hangisi Daha Büyük?**
- Wordle: aynı gizli Türkçe kelime, 4–7 harf seçimi, 6 deneme, harf-konum renkleri ve çözme sırasına göre puan.
- Kelimelik: harfler zamanla açılır, yanlış tahminlerden sonra tekrar denenebilir, ilk doğru tahmin en yüksek puanı alır; isim, şehir, ülke, film, sanatçı ve nesne kategorileri seçilebilir.
- Bağdaştırıcı: kolay/orta/zor kelime setleri, birden fazla kabul edilen bağlantı ve oda sahibinin ek cevapları değerlendirmesi.
- Palavra: anonim blöf gönderimi, karıştırılmış cevaplar, doğru cevabı bulma ve başkasını kandırma puanları. Cevap sahibi oylama bitene kadar gizlidir.
- Yüz Kişiye Sorduk: popülerlik puanlı seçenekler ve tur sonunda sıralama. **Bu cevaplar oyun için hazırlanmıştır; gerçek anket araştırması değildir.**
- Hangisi Daha Büyük?: coğrafya, hayvanlar, bilim, tarih, spor, film, müzik ve genel kültür kategorileri; her soruda ölçüt, doğru cevap ve açıklama.
- Yeni oyun havuzları `data/new-games.js` dosyasındadır. `npm test` içerik havuzlarını, veri alanlarını ve mevcut medya çözümleme testlerini kontrol eder.

## Kullanıcı test düzeltmeleri (2026-11-23)
- Wordle tur süresi en az 75 saniyeye çıkarıldı.
- Karma Mod'da seçili her oyun için görünür `Çıkar` kontrolü eklendi.
- 10 saniyelik Pikseli Aç turlarında görsel seviye geçişi hızlandırıldı.
- Türkçe müzik kataloğuna 161 ek kayıt eklendi; tekrarlar ayıklanınca toplam katalog 221 parçaya ulaştı. Rap, Türkçe pop, rock ve alternatif türleri ile sanatçı filtreleri genişletildi. Ses önizlemesi bulunmayan parçalar sağlayıcı tarafından yine atlanabilir.

## Filmden Kareyi Bil – TMDB çözümlemesi (2026-11-23)
- TMDB anahtarı uygulama açılırken `TMDB_API_KEY` veya `TMDB_READ_ACCESS_TOKEN` ortam değişkeninden okunur; anahtar istemciye gönderilmez.
- Film adı/yılıyla arama yapılır; yıl filtresi sonuç vermiyorsa yıl olmadan tekrar denenir. TMDB arama sonucundaki `backdrop_path` doğrudan yedek olarak tutulur, ardından `/movie/{id}/images` tüm dil seçenekleriyle çağrılır.
- TMDB tek bir kullanılabilir backdrop döndürse bile tur başlatılır. Beş farklı kare yoksa Wikimedia Commons denenir; iki sağlayıcıdan sonra da tek kare varsa oyun turu oynatabilmek için aynı kare tekrar kullanılır.
- `media-status` yanıtındaki `lastFilmError`, `filmNoFrames` ve `filmSuccess` alanları tanılamaya yardımcı olur. Render'da dış ağ erişimi ve ortam değişkeni güncel deploy'da kontrol edilmelidir.

## Yeni görsel ve evren oyunları (2026-11-23)
- **Logoyu Tanı:** 40 marka logosu.
- **Ünlüyü Tanı:** 25 Türk ve 25 yabancı ünlünün karışık havuzu. Ayrıca Türk ve yabancı ünlüler için ayrı oyun seçenekleri vardır; görseller Wikipedia, bulunamazsa Wikimedia Commons üzerinden çözülür.
- **Futbolcuyu Tanı:** 30 futbolcu görseli.
- **Bayrağı Tanı:** 40 ülke bayrağı.
- **Film & Dizi Evreni:** 35 Marvel, Harry Potter, Star Wars, DC ve popüler dizi sorusu.
- Bu oyunlar Karma Mod'a da eklenebilir. Görsel sorular dört seçeneklidir; doğru cevap istemciye tur bitene kadar gönderilmez.
- Genel içerik havuzları da genişletildi: Doğru/Yanlış 51, Hızlı Quiz 83, Hangisi Yalan 33, Emojiden Tahmin 42 kayıt. Görsel oyun havuzları `data/visual-games.js` dosyasındadır.

- Wordle/Kelimelik kelime havuzları: kolay 78, orta 78, zor 53 kelime. Bağdaştırıcı 44, Palavra 26, Yüz Kişiye Sorduk 36, Hangisi Daha Büyük? 53 kayıt içerir; kelime kategorilerinin her biri 21–25 kayıt aralığına çıkarıldı. Pikseli Aç havuzu 306 farklı kayıt içerir.


## Futbol kulübü armaları (2026-11-23)
- **Futbol Kulübü Logosunu Tanı:** 39 Türk ve yabancı kulüp arması.
- Kulüp armaları Wikimedia Commons'ta kulüp adı + crest/logo sorgularıyla aranır; görsel bulunamazsa kulübün Wikipedia sayfa görseli yedek olarak kullanılır.
- Dört seçenekli, doğru cevabı tur sonuna kadar gizli ve Karma Mod'a eklenebilir.
- Görsel havuzu ve oyun akışı `data/visual-games.js`, `data/media.js`, `server.js` ve `index.html` içindedir.

## Hızlı cevap ve tutarlı seçenekler (2026-11-24)
- Şarkı oyununda seçenekler artık oyun ekranında görünür; seçenekler hedef parçayla aynı sanatçı kataloğundan alınır. Filtreler hedef şarkıyı belirlerken, çeldiriciler sanatçının tüm katalog kayıtlarından seçilir. Sanatçıda yeterli parça yoksa başka sanatçıdan yanıltıcı seçenek eklenmez.
- Ünlüyü Tanı oyunlarında aynı cinsiyetten üç çeldirici bulunamayan görsel soru atlanır; karışık cinsiyet veya uydurma seçenek gösterilmez.
- Doğru cevabı hızlı veren oyunculara ek hız puanı verilir; bu bonus genel quiz, görsel tanıma, şarkı/film/piksel, anket ve çoğunluk oyunlarına eklendi. İlk doğru cevapların mevcut puan avantajları da korunur.
- Müzik içerik dosyasına yeni kayıtlar eklendi. Aynı sanatçının yeterli şarkısı bulunduğunda dört seçenek gösterilir.
- Yeni doğrulama: `test/song-options-validation.js`; tam kontrol `npm test` ile yapılır.


## Sürüm 7 – Şarkı tahmini, film kareleri ve içerik genişletmesi
- Şarkı oyunundaki çoktan seçmeli şıklar kaldırıldı. Oyuncular parçayı dinleyip şarkı adını yazarak tahmin ediyor; doğru cevap yine ilk doğru cevap ve hız bonusuna göre puanlanıyor.
- Müzik filtrelerine Türkçe / Yabancı ayrımı, Manifest, Oğuzhan Koç ve çok sayıda Türk/yabancı sanatçı kategorisi eklendi. Sanatçı filtresi de genişletildi.
- Şarkı kataloğu 240+ parçaya çıkarıldı; Manifest, Oğuzhan Koç, Tarkan, Sezen Aksu, Mabel Matiz, Edis, Madrigal, Motive, The Weeknd, Taylor Swift, Dua Lipa, Billie Eilish, Ed Sheeran, Adele, Queen, Linkin Park ve daha fazlası eklendi. Ses, sağlayıcılarda mevcut önizlemelerden çözülür.
- Filmden Kareyi Bil oyununda beş kademeli sahne akışı kullanılır; film havuzu genişletildi. TMDB anahtarı önerilir, anahtarsız yedek kaynak korunur.
- Doğru/Yanlış, Quiz, Emoji, En Yakın, Hangisi Yalan, Kimi Seçerdin ve Kim Daha Olası havuzlarına yeni içerikler eklendi.
- Test: `npm test` (tüm testler başarılı).
