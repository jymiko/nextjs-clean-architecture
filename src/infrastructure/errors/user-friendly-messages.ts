export const userFriendlyMessages: Record<string, string> = {
  // Authentication errors
  'Invalid credentials': 'Email atau kata sandi yang Anda masukkan salah. Silakan periksa kembali dan coba lagi.',
  'Validation Error': 'Data yang Anda masukkan belum lengkap atau tidak valid. Silakan periksa kembali formulir.',
  'User not found': 'Akun dengan email tersebut tidak ditemukan. Silakan periksa kembali email Anda.',
  'Invalid password': 'Kata sandi yang Anda masukkan salah. Silakan coba lagi.',
  'Email already exists': 'Email tersebut sudah terdaftar. Silakan gunakan email lain atau coba masuk.',
  'Account disabled': 'Akun Anda dinonaktifkan. Silakan hubungi administrator untuk bantuan.',
  'Account locked': 'Akun Anda terkunci karena terlalu banyak percobaan masuk. Silakan coba lagi beberapa saat.',

  // Token errors
  'Invalid token': 'Token tidak valid. Silakan masuk kembali.',
  'Token expired': 'Sesi Anda telah berakhir. Silakan masuk kembali.',
  'Invalid refresh token': 'Token penyegar tidak valid. Silakan masuk kembali.',
  'No token provided': 'Token tidak ditemukan. Silakan masuk kembali.',
  'Invalid or expired token': 'Token tidak valid atau telah kedaluwarsa. Silakan masuk kembali.',

  // Authorization errors
  'Unauthorized': 'Anda tidak memiliki izin untuk mengakses halaman ini.',
  'Forbidden': 'Akses ditolak. Anda tidak memiliki izin yang cukup.',
  'Access denied': 'Akses ditolak. Silakan hubungi administrator jika ini adalah kesalahan.',

  // Validation errors
  'Email is required': 'Email wajib diisi.',
  'Password is required': 'Kata sandi wajib diisi.',
  'Invalid email format': 'Format email tidak valid. Contoh: user@example.com',
  'Password too weak': 'Kata sandi terlalu lemah. Gunakan minimal 8 karakter dengan kombinasi huruf dan angka.',
  'Password mismatch': 'Kata sandi tidak cocok. Silakan periksa kembali.',
  'Name is required': 'Nama wajib diisi.',
  'Name too short': 'Nama terlalu pendek. Minimal 3 karakter.',
  'Name too long': 'Nama terlalu panjang. Maksimal 100 karakter.',

  // Database errors
  'Database error': 'Terjadi kesalahan pada database. Silakan coba lagi nanti.',
  'Unique constraint violation': 'Data tersebut sudah ada. Silakan gunakan data yang berbeda.',
  'Record not found': 'Data tidak ditemukan. Silakan periksa kembali.',

  // Rate limiting errors
  'Too many requests': 'Terlalu banyak permintaan. Silakan coba lagi dalam beberapa saat.',
  'Rate limit exceeded': 'Batas percobaan terlampaui. Silakan tunggu beberapa saat sebelum mencoba lagi.',

  // System errors
  'Internal server error': 'Terjadi kesalahan pada sistem. Silakan coba lagi nanti.',
  'Service unavailable': 'Layanan sedang tidak tersedia. Silakan coba lagi dalam beberapa saat.',
  'Network error': 'Terjadi masalah koneksi. Silakan periksa koneksi internet Anda.',

  // File upload errors
  'File too large': 'Ukuran file terlalu besar. Maksimal ukuran file adalah 10MB.',
  'Invalid file type': 'Tipe file tidak valid. Silakan upload file dengan format yang benar.',
  'Upload failed': 'Gagal mengupload file. Silakan coba lagi.',

  // General errors
  'Bad request': 'Permintaan tidak valid. Silakan periksa kembali data Anda.',
  'Not found': 'Halaman atau data yang Anda cari tidak ditemukan.',
  'Method not allowed': 'Metode tidak diizinkan. Silakan gunakan metode yang benar.',
};

export const getUserFriendlyMessage = (error: string): string => {
  return userFriendlyMessages[error] || error;
};

export const createErrorResponse = (
  error: string,
  status: number = 500,
  details?: any
) => {
  const friendlyMessage = getUserFriendlyMessage(error);

  return {
    error: friendlyMessage,
    status,
    details: details && process.env.NODE_ENV === 'development' ? details : undefined,
  };
};