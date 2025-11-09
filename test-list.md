## Business

### Unit (13 test)
1. `tests/Unit/DataTransferObjects/BusinessDTOTest.php` – Membuat DTO dari data request dan user ID.
2. `tests/Unit/DataTransferObjects/BusinessDTOTest.php` – Mengubah DTO menjadi array yang siap dikirim ke repository.
3. `tests/Unit/Services/BusinessServiceTest.php` – Menyimpan bisnis melalui repository.
4. `tests/Unit/Services/BusinessServiceTest.php` – Memperbarui bisnis saat pemilik cocok.
5. `tests/Unit/Services/BusinessServiceTest.php` – Menghasilkan `null` ketika bisnis bukan milik pengguna.
6. `tests/Unit/Services/BusinessServiceTest.php` – Menghapus bisnis milik pengguna.
7. `tests/Unit/Services/BusinessServiceTest.php` – Gagal menghapus jika pengguna bukan pemilik.
8. `tests/Unit/Repositories/Business/EloquentBusinessRepositoryTest.php` – Menyimpan bisnis dan mengembalikan model.
9. `tests/Unit/Repositories/Business/EloquentBusinessRepositoryTest.php` – Memperbarui record bisnis.
10. `tests/Unit/Repositories/Business/EloquentBusinessRepositoryTest.php` – Menghapus record bisnis.
11. `tests/Unit/Repositories/Business/EloquentBusinessRepositoryTest.php` – Mengambil daftar bisnis berdasarkan owner.
12. `tests/Unit/Middleware/EnsureBusinessOwnerTest.php` – Mengizinkan pemilik melanjutkan.
13. `tests/Unit/Middleware/EnsureBusinessOwnerTest.php` – Memblokir akses ketika bukan pemilik.

### Regression / Feature (7 test)
1. `tests/Feature/Business/ManageBusinessTest.php` – Businessman dapat membuat bisnis.
2. `tests/Feature/Business/ManageBusinessTest.php` – Validasi wajib saat membuat bisnis.
3. `tests/Feature/Business/ManageBusinessTest.php` – Memperbarui bisnis milik sendiri.
4. `tests/Feature/Business/ManageBusinessTest.php` – Menolak update bisnis milik orang lain.
5. `tests/Feature/Business/ManageBusinessTest.php` – Menghapus bisnis milik sendiri.
6. `tests/Feature/Business/ManageBusinessTest.php` – Menolak penghapusan bisnis milik orang lain.
7. `tests/Feature/Business/BusinessFlowsRegressionTest.php` – Alur CRUD bisnis penuh sebagai regresi.

---

## Branch

### Unit (12 test)
1. `tests/Unit/DataTransferObjects/BranchDTOTest.php` – Membuat DTO cabang dari request pengguna.
2. `tests/Unit/DataTransferObjects/BranchDTOTest.php` – Mengubah DTO cabang menjadi payload repository.
3. `tests/Unit/Services/BranchServiceTest.php` – Menyimpan cabang dan memuat relasi bisnis.
4. `tests/Unit/Services/BranchServiceTest.php` – Memperbarui cabang dan memuat ulang bisnis.
5. `tests/Unit/Services/BranchServiceTest.php` – Menghapus cabang melalui repository.
6. `tests/Unit/Services/BranchServiceTest.php` – Menghasilkan data opsi cabang untuk pemilik.
7. `tests/Unit/Repositories/Branch/EloquentBranchRepositoryTest.php` – Menyimpan cabang dan mengembalikan model.
8. `tests/Unit/Repositories/Branch/EloquentBranchRepositoryTest.php` – Memperbarui cabang tersimpan.
9. `tests/Unit/Repositories/Branch/EloquentBranchRepositoryTest.php` – Menghapus record cabang.
10. `tests/Unit/Repositories/Branch/EloquentBranchRepositoryTest.php` – Mengambil cabang berdasarkan owner.
11. `tests/Unit/Repositories/Branch/EloquentBranchRepositoryTest.php` – Mengambil cabang berdasarkan bisnis.
12. `tests/Unit/Repositories/Branch/EloquentBranchRepositoryTest.php` – Mengambil cabang berdasarkan user assignment.

### Regression / Feature (5 test)
1. `tests/Feature/Branch/ManageBranchTest.php` – Businessman dapat membuat cabang.
2. `tests/Feature/Branch/ManageBranchTest.php` – Validasi wajib saat membuat cabang.
3. `tests/Feature/Branch/ManageBranchTest.php` – Memperbarui cabang yang ada.
4. `tests/Feature/Branch/ManageBranchTest.php` – Menghapus cabang.
5. `tests/Feature/Branch/BranchFlowsRegressionTest.php` – Alur CRUD cabang penuh sebagai regresi.

---

## Category

### Unit (14 test)
1. `tests/Unit/DataTransferObjects/CategoryDTOTest.php` – Membuat DTO kategori dari request.
2. `tests/Unit/DataTransferObjects/CategoryDTOTest.php` – Mengubah DTO kategori menjadi payload repository.
3. `tests/Unit/Services/CategoryServiceTest.php` – Menyimpan kategori dan sinkron cabang.
4. `tests/Unit/Services/CategoryServiceTest.php` – Memperbarui kategori dan memuat ulang.
5. `tests/Unit/Services/CategoryServiceTest.php` – Menghapus kategori beserta relasinya.
6. `tests/Unit/Repositories/Category/EloquentCategoryRepositoryTest.php` – Menyimpan kategori.
7. `tests/Unit/Repositories/Category/EloquentCategoryRepositoryTest.php` – Memperbarui kategori.
8. `tests/Unit/Repositories/Category/EloquentCategoryRepositoryTest.php` – Menghapus kategori.
9. `tests/Unit/Repositories/Category/EloquentCategoryRepositoryTest.php` – Mengambil kategori berdasarkan owner.
10. `tests/Unit/Repositories/Category/EloquentCategoryRepositoryTest.php` – Mengambil kategori berdasarkan cabang.
11. `tests/Unit/Repositories/Category/EloquentCategoryRepositoryTest.php` – Mengambil kategori berdasarkan bisnis.
12. `tests/Unit/Repositories/CategoryBranch/EloquentCategoryBranchRepositoryTest.php` – Menyisipkan batch relasi kategori-cabang.
13. `tests/Unit/Repositories/CategoryBranch/EloquentCategoryBranchRepositoryTest.php` – Menghapus relasi berdasarkan kategori.
14. `tests/Unit/Repositories/CategoryBranch/EloquentCategoryBranchRepositoryTest.php` – Mengambil relasi berdasarkan kategori.

### Regression / Feature (5 test)
1. `tests/Feature/Category/ManageCategoryTest.php` – Businessman dapat membuat kategori.
2. `tests/Feature/Category/ManageCategoryTest.php` – Validasi wajib saat membuat kategori.
3. `tests/Feature/Category/ManageCategoryTest.php` – Memperbarui kategori yang ada.
4. `tests/Feature/Category/ManageCategoryTest.php` – Menghapus kategori.
5. `tests/Feature/Category/CategoryFlowsRegressionTest.php` – Alur CRUD kategori penuh sebagai regresi.

---

## Product

### Unit (13 test)
1. `tests/Unit/DataTransferObjects/ProductDTOTest.php` – Membuat DTO produk dari request.
2. `tests/Unit/DataTransferObjects/ProductDTOTest.php` – Mengubah DTO produk menjadi payload repository.
3. `tests/Unit/Services/ProductServiceTest.php` – Menyimpan produk dan sinkron cabang.
4. `tests/Unit/Services/ProductServiceTest.php` – Memperbarui produk ketika user memiliki akses cabang.
5. `tests/Unit/Services/ProductServiceTest.php` – Menghapus produk saat pengguna berhak.
6. `tests/Unit/Repositories/Product/EloquentProductRepositoryTest.php` – Menyimpan produk.
7. `tests/Unit/Repositories/Product/EloquentProductRepositoryTest.php` – Memperbarui produk.
8. `tests/Unit/Repositories/Product/EloquentProductRepositoryTest.php` – Menghapus produk.
9. `tests/Unit/Repositories/Product/EloquentProductRepositoryTest.php` – Mengambil produk berdasarkan cabang/bisnis/kategori.
10. `tests/Unit/Repositories/Product/EloquentProductRepositoryTest.php` – Memfilter produk milik pengguna.
11. `tests/Unit/Repositories/ProductBranch/EloquentProductBranchRepositoryTest.php` – Menyisipkan batch relasi produk-cabang.
12. `tests/Unit/Repositories/ProductBranch/EloquentProductBranchRepositoryTest.php` – Menghapus relasi berdasarkan produk.
13. `tests/Unit/Repositories/ProductBranch/EloquentProductBranchRepositoryTest.php` – Mengambil relasi berdasarkan produk.

### Regression / Feature (5 test)
1. `tests/Feature/Product/ManageProductTest.php` – Businessman dapat membuat produk.
2. `tests/Feature/Product/ManageProductTest.php` – Validasi wajib saat membuat produk.
3. `tests/Feature/Product/ManageProductTest.php` – Memperbarui produk yang ada.
4. `tests/Feature/Product/ManageProductTest.php` – Menghapus produk.
5. `tests/Feature/Product/ProductFlowsRegressionTest.php` – Alur CRUD produk penuh sebagai regresi.

---

Total: **74** test (sesuai hasil `php artisan test`).
