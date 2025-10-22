# Ürün Gereksinim Dokümanı: Öğrenci Test Platformu V2

**Versiyon:** 2.1 (Sınıf Hiyerarşisi Eklendi)
**Tarih:** 25.07.2024
**Yazar:** Proje Sahibi

---

## 1. Giriş

### 1.1. Projenin Amacı

Bu doküman, "Öğrenci Test Platformu" uygulamasının V2 sürümünün gereksinimlerini, özelliklerini ve teknik altyapısını tanımlamaktadır. Projenin temel amacı, yöneticilerin (admin) hiyerarşik bir yapıda (**Sınıf > Ders > Ünite > Konu > Test**) test içeriği oluşturabildiği, öğrencilerin (user) ise bu testleri çözerek sonuçlarını ve performans gelişimlerini takip edebildiği, rol tabanlı, güvenli ve modern bir online test platformu oluşturmaktır.

### 1.2. Hedef Kitle

-   **Öğrenciler (User):** Kendilerini test etmek, bilgi seviyelerini ölçmek ve zaman içindeki gelişimlerini görsel olarak takip etmek isteyen kullanıcılar.
-   **Yöneticiler/Eğitmenler (Admin):** Test içeriğini (sınıflar, dersler, sorular, vb.) oluşturmak, yönetmek, toplu halde içe aktarmak ve platform kullanıcılarını denetlemek isteyen yetkili kullanıcılar.

---

## 2. Teknik Mimari ve Teknoloji Yığını

-   **Proje Kurulumu:** **Vite** - Hızlı geliştirme ve derleme süreçleri için.
-   **UI Kütüphanesi:** **React** & **TypeScript** - Tip güvenliğine sahip, komponent bazlı ve reaktif bir kullanıcı arayüzü için.
-   **Yönlendirme (Routing):** **React Router DOM** (`HashRouter` ile) - Tek Sayfa Uygulaması (SPA) mimarisinde sayfa yönlendirmeleri için.
-   **Global Durum Yönetimi:** **Zustand** - Kullanıcı oturumu (session) ve profil bilgileri gibi global state'lerin yönetimi için basit ve etkili bir çözüm.
-   **Stil Yönetimi:** **Tailwind CSS** - Hızlı ve özelleştirilebilir "utility-first" CSS çerçevesi.
-   **Backend ve Veritabanı:** **Supabase** - PostgreSQL veritabanı, kullanıcı yönetimi (Authentication), sunucusuz fonksiyonlar (RPC) ve Satır Seviyesi Güvenlik (RLS) için hepsi bir arada bir platform.
-   **UI Komponentleri:** Projeye özel, yeniden kullanılabilir temel bileşenler (`Card`, `Button`, `Input`, `Modal`, `ProgressBar`, `Spinner`).

---

## 3. Veritabanı Şeması

Uygulamanın tüm özelliklerini desteklemek için aşağıdaki veritabanı şeması kullanılacaktır.

| Tablo Adı           | Açıklama                                                                                                     |
| :------------------ | :----------------------------------------------------------------------------------------------------------- |
| `profiles`          | Kullanıcıların rollerini (`admin`/`user`) ve temel bilgilerini `auth.users` tablosuyla ilişkili olarak tutar.     |
| `classes`           | Sınıf seviyelerini tutar (örn: 9. Sınıf, 10. Sınıf). Hiyerarşinin en üst seviyesidir.                            |
| `courses`           | Bir sınıfa (`class`) ait ana ders kategorilerini tutar (örn: Matematik, Fizik).                                |
| `units`             | Bir derse (`course`) ait üniteleri tutar (örn: Temel Kavramlar).                                               |
| `topics`            | Bir üniteye (`unit`) ait konuları tutar (örn: Sayılar).                                                        |
| `tests`             | Bir konuya (`topic`) ait testleri tutar (örn: Rasyonel Sayılar Testi).                                         |
| `questions`         | Bir teste (`test`) ait soruları tutar.                                                                       |
| `options`           | Bir soruya (`question`) ait şıkları ve hangisinin doğru olduğunu (`is_correct`) tutar.                          |
| `test_attempts`     | Bir kullanıcının bir testi çözme denemesini, aldığı puanı (`score`) ve tarihini kaydeder.                     |
| `user_answers`      | Bir test denemesinde (`test_attempt`), kullanıcının her bir soruya verdiği cevabı kaydeder.                    |

**Önemli Not:** `classes`, `courses`, `units`, `topics`, `tests` tabloları arasında `ON DELETE CASCADE` ilişkisi kurulmalıdır. Bu sayede bir üst hiyerarşideki öğe (örn: bir `class`) silindiğinde, ona bağlı tüm alt öğeler (dersler, üniteler, konular, testler, sorular...) otomatik olarak veritabanından temizlenir.

---

## 4. Kullanıcı Rolleri ve Erişim Kontrolü (RBAC)

Sistemde iki temel kullanıcı rolü bulunur ve erişim izinleri hem arayüzde (`ProtectedRoute` komponenti) hem de veritabanı katmanında (Supabase RLS) zorunlu kılınır.

| Rol     | Açıklama                                                                                                                                                                                                       |
| :------ | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `user`  | **Öğrenci.** Sadece testleri çözebilir, kendi sonuçlarını ve profil sayfasını görüntüleyebilir. Yönetici paneline erişemez ve içerik üzerinde herhangi bir değişiklik yapamaz.                                    |
| `admin` | **Yönetici.** `user` rolünün tüm yetkilerine ek olarak `/admin` paneline erişebilir. Platformdaki tüm içerikleri (sınıf, ders, ünite, konu, test, soru) oluşturabilir, silebilir. Tüm kullanıcıları listeleyebilir, rollerini değiştirebilir ve silebilir. |

---

## 5. Özellik Gereksinimleri

### 5.1. Kullanıcı Yönetimi (Auth)

-   **Kayıt Olma:** Kullanıcılar `Ad Soyad`, `E-posta` ve `Şifre` ile sisteme kayıt olabilir. Kayıt sonrası Supabase Auth tarafından bir doğrulama e-postası gönderilmelidir.
-   **Giriş Yapma:** Kayıtlı kullanıcılar `E-posta` ve `Şifre` ile giriş yapabilir. Başarılı giriş sonrası ana sayfaya yönlendirilirler.
-   **Otomatik Profil Oluşturma:** Supabase'de yeni bir kullanıcı (`auth.users`) oluşturulduğunda, bir veritabanı tetikleyicisi (`trigger`) otomatik olarak `profiles` tablosunda bu kullanıcı için varsayılan `user` rolüyle bir satır oluşturmalıdır.
-   **Çıkış Yapma:** Kullanıcılar, `Header`'daki "Çıkış Yap" butonu ile güvenli bir şekilde oturumu sonlandırabilir.

### 5.2. Ana Sayfa (Test Listesi)

-   Giriş yapan kullanıcılar, çözebilecekleri tüm testleri hiyerarşik bir yapıda görmelidir.
-   Arayüz, iç içe açılır-kapanır (`details`/accordion) menüler şeklinde olmalıdır:
    -   Sınıf Adı (en üst seviye)
        -   Ders Adı
            -   Ünite Adı
                -   Konu Adı
                    -   Test Adı ve Açıklaması
-   Her testin yanında, kullanıcıyı teste yönlendirecek bir "Teste Başla" butonu bulunmalıdır.
-   Eğer sistemde hiç test yoksa, kullanıcıya "Henüz çözülecek test bulunmuyor" gibi bilgilendirici bir mesaj gösterilmelidir.
-   **Teknik Not:** Veri çekme işlemi, Supabase şema önbellek sorunlarına karşı bir önlem olarak her tablo (`classes`, `courses`, `units`, `topics`, `tests`) için ayrı sorgularla yapılmalı ve istemci tarafında birleştirilerek hiyerarşi oluşturulmalıdır.

### 5.3. Test Çözme Akışı

1.  **Test Sayfası (`/test/:testId`):**
    -   Sayfa yüklendiğinde, URL'deki `testId`'ye ait testin adı ve soruları veritabanından çekilmelidir.
    -   Ekranın üst kısmında testin adı, **5 dakikalık (300 saniye)** bir geri sayım sayacı ve kullanıcının ilerlemesini gösteren bir **ilerleme çubuğu (`ProgressBar`)** bulunmalıdır.
    -   Sorular ve şıkları ekrana tek tek gelmelidir.
    -   Kullanıcı bir şıkkı seçtiğinde, seçilen şık görsel olarak vurgulanmalıdır.

2.  **Testi Bitirme Mantığı:**
    -   Kullanıcı son soruyu cevaplayıp "Testi Bitir" butonuna tıkladığında VEYA 5 dakikalık süre dolduğunda test otomatik olarak sonlanmalıdır.
    -   Bu işlem tetiklendiğinde aşağıdaki adımlar sırayla gerçekleştirilmelidir:
        1.  Doğru cevap sayısına göre kullanıcının puanı (100 üzerinden) hesaplanır.
        2.  `test_attempts` tablosuna `user_id`, `test_id` ve hesaplanan `score` ile yeni bir kayıt eklenir.
        3.  Bu yeni oluşturulan denemenin `id`'si alınır.
        4.  Kullanıcının test boyunca verdiği tüm cevaplar, bu `attempt_id` ile ilişkilendirilerek `user_answers` tablosuna toplu olarak eklenir.
        5.  İşlemler tamamlandıktan sonra kullanıcı, yeni oluşturulan deneme ID'si ile sonuç sayfasına (`/result/:attemptId`) yönlendirilir.

3.  **Sonuç Sayfası (`/result/:attemptId`):**
    -   Sayfada testin adı ve çözülme tarihi gösterilir.
    -   Kullanıcının **Puanı**, **Doğru Sayısı** ve **Yanlış Sayısı** özet kartlar içinde sunulur.
    -   "Cevap Analizi" bölümünde, testteki her bir soru için:
        -   Soru metni
        -   Kullanıcının verdiği cevap (doğru ise yeşil, yanlış ise kırmızı arka planla vurgulanmalı)
        -   Eğer kullanıcının cevabı yanlışsa, doğru cevap da ayrıca gösterilmelidir.
    -   Sayfanın altında "Ana Sayfaya Dön" butonu bulunmalıdır.

### 5.4. Profil Sayfası (`/profile`)

-   Kullanıcının adı, soyadı ve rolü gibi temel profil bilgileri bir kart içinde gösterilmelidir.
-   **Performans Grafiği:**
    -   Bu bölümde, kullanıcının geçmiş test denemelerine dayalı bir **çubuk grafik** yer almalıdır.
    -   Grafikteki her bir çubuk, bir test kategorisini (test adını) temsil etmelidir.
    -   Çubuğun yüksekliği, kullanıcının o testten aldığı **ortalama puanı** göstermelidir.
    -   Kullanıcı fare imlecini bir çubuğun üzerine getirdiğinde, o teste ait ortalama puan net bir şekilde bir baloncuk içinde gösterilmelidir.
-   **Geçmiş Testlerim:**
    -   Bu bölümde, kullanıcının daha önce çözdüğü tüm testlerin bir listesi tablo formatında sunulmalıdır.
    -   Tabloda `Test Adı`, `Puan`, ve `Tarih` sütunları bulunmalıdır.
    -   Puan, başarı durumuna göre (örn: 50'den büyükse yeşil, küçükse kırmızı) renklendirilmiş bir etiket içinde gösterilebilir.

### 5.5. Yönetici Paneli (`/admin`)

Bu panel, sekmeli bir yapıya sahip olmalı ve sadece `admin` rolündeki kullanıcılar tarafından erişilebilir olmalıdır.

1.  **İçerik Yönetimi Sekmesi:**
    -   Sınıf, Ders, Ünite, Konu ve Test hiyerarşisini yönetmek için ayrı ayrı kartlar bulunmalıdır.
    -   Yönetici, ilgili input alanına yeni bir isim girip "Ekle" butonuna basarak yeni bir öğe oluşturabilir.
    -   Her öğe listesinde, öğenin yanında bir "Sil" butonu bulunmalıdır. Silme işlemi, kullanıcıya bir onay modalı (`Modal`) gösterdikten sonra gerçekleştirilmelidir.
    -   Ders, ünite, konu ve test ekleme arayüzleri, bir üst hiyerarşiyi seçmeyi gerektiren bağımlı seçim (`select`) kutuları içermelidir (örn: ders eklemek için önce sınıf seçilmelidir).

2.  **Soruları Yönet Sekmesi:**
    -   Yönetici, `Sınıf > Ders > Ünite > Konu > Test` hiyerarşisini takip eden bir dizi seçim kutusu kullanarak soru eklemek veya görmek istediği testi seçmelidir.
    -   Bir test seçildiğinde:
        -   O teste ait mevcut sorular, şıklarıyla birlikte listelenir. Doğru şık görsel olarak belirtilmelidir. Her sorunun yanında bir "Sil" butonu bulunmalıdır.
        -   "Yeni Soru Ekle" formunda yönetici, soru metnini ve en az iki seçenek girebilir. "Seçenek Ekle/Sil" butonları ile seçenek sayısını dinamik olarak değiştirebilmelidir. Doğru seçeneği bir `radio` butonu ile işaretlemelidir.

3.  **Toplu İçe Aktar Sekmesi:**
    -   Yönetici, soru eklemek istediği testi hiyerarşik seçim kutularından seçmelidir.
    -   Bir dosya yükleme (`input type="file"`) alanı ile `.csv` uzantılı bir dosya seçebilmelidir.
    -   CSV dosyasının formatı katı bir şekilde `soru metni,seçenek1,seçenek2,...,doğru_seçenek_indeksi` şeklinde olmalıdır (indeks 1'den başlar).
    -   "İçe Aktar" butonuna basıldığında, dosya okunmalı, her satır ayrıştırılmalı ve sorular veritabanına toplu olarak eklenmelidir. Bu işlem için bir Supabase RPC fonksiyonu (`create_bulk_questions_with_options`) kullanılmalıdır.
    -   İşlem sonunda kullanıcıya kaç sorunun başarıyla eklendiği ve kaç satırın hatalı olduğu bilgisi verilmelidir.

4.  **Kullanıcıları Yönet Sekmesi:**
    -   Sistemdeki tüm kullanıcılar; `Ad Soyad`, `E-posta` ve `Rol` bilgileriyle bir tabloda listelenmelidir.
    -   Her kullanıcının satırında, rolünü (`user`/`admin`) değiştirmeye yarayan bir seçim kutusu ve kullanıcıyı sistemden kalıcı olarak silen bir "Sil" butonu bulunmalıdır.
    -   Bir yönetici kendi rolünü değiştiremez veya kendi hesabını silemez. Bu işlemler arayüzde engellenmelidir.
    -   Kullanıcı listeleme (`get_all_users`) ve silme (`delete_user_by_admin`) işlemleri, güvenlik nedeniyle `SECURITY DEFINER` olarak ayarlanmış Supabase RPC fonksiyonları üzerinden yapılmalıdır.