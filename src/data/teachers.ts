export interface TeacherProfile {
    name: string;
    shortName: string;
    role: string; // inferred from subjects
    subjects: string;
    education: string;
    experience: string[];
    achievements: string[];
    achievementsNon?: string[];
    image: string; // URL or placeholder
}

export const teachersData: TeacherProfile[] = [
    {
        name: "Noriven, SE",
        shortName: "Noriven",
        role: "Founder & Mathematics Expert",
        subjects: "Matematika, Fisika, Inggris",
        education: "S1 Ekonomi",
        experience: [
            "Tutor Riven Course (2014 - sekarang)",
            "Guru SMP & SMA Monte Sienna School (2020 - 2022)",
            "Guru SMP & SMA AIS (Australian Intercultural School) (2020)",
            "Guru SD Sekolah Bodhi Dharma (2008 - 2009)",
            "Tutor Primagama (2007 - 2009)"
        ],
        achievements: [
            "Juara 2 Olimpiade Rihand Creative Guru Indonesia bidang studi Matematika tahun 2022",
            "Juara 1 lomba baca Paritta Suci tingkat provinsi tahun 2009",
            "Juara 3 Olimpiade Astronomi tingkat SMA Kota Batam tahun 2006",
            "Juara 2 Olimpiade Astronomi tingkat Provinsi Kepri tahun 2006",
            "Juara 2 lomba baca puisi Kemerdekaan RI tingkat SMA Kota Batam tahun 2005",
            "Juara 1 lomba baca Paritta Suci tingkat SMP tahun 2003"
        ],
        achievementsNon: [
            "Juara 3 Porkot (Pekan Olahraga Kota) cabor Taekwondo Kota Batam tahun 2014",
            "Juara 3 lomba Acting Kategori Dewasa Kota Batam tahun 2010",
            "Juara 1 Palang Merah Remaja (PMR) tingkat Madya Kota Batam tahun 2002"
        ],
        image: "https://lh3.googleusercontent.com/d/1wW4iFwO9OaQv6pX4YlZgC2jUqK5qV9X_" // Founder placeholder
    },
    {
        name: "Mahardika Wiryawan, S.Pd",
        shortName: "Mahardika",
        role: "Biology & Science Expert",
        subjects: "Biologi, Matematika, Inggris",
        education: "S1 Pendidikan Biologi",
        experience: [
            "Tutor Riven Course (2019 - sekarang)",
            "Guru IPA dan MTK SMP Teramia (2023 - sekarang)"
        ],
        achievements: [
            "Peserta Olimpiade Biologi tingkat SMA Kota Batam (2018 & 2019)"
        ],
        image: "https://ui-avatars.com/api/?name=Mahardika+Wiryawan&background=1e3a8a&color=ffffff&size=200"
    },
    {
        name: "Irma Wulandari, A.Md",
        shortName: "Irma",
        role: "Chemistry & Mathematics Teacher",
        subjects: "Kimia, Matematika, Inggris",
        education: "ITS - D3 Teknik Kimia",
        experience: [
            "Tutor Riven Course (2015 - sekarang)"
        ],
        achievements: [
            "Berhasil membimbing siswa masuk SMA unggulan di Surabaya dan PTN (ITS, UneJ, UnAir)"
        ],
        image: "https://ui-avatars.com/api/?name=Irma+Wulandari&background=f59e0b&color=ffffff&size=200"
    },
    {
        name: "Ruth Kekelengenta Sembiring, S.Pd",
        shortName: "Ruth",
        role: "Elementary & Math Teacher",
        subjects: "Matematika, Biologi",
        education: "S1 Pendidikan Guru Sekolah Dasar",
        experience: [
            "Guru Kelas 3 (2024)",
            "Guru Les SD (2024)"
        ],
        achievements: [
            "MBKM Kampus Mengajar Angkatan 4 (2022)"
        ],
        image: "https://ui-avatars.com/api/?name=Ruth+Sembiring&background=1e3a8a&color=ffffff&size=200"
    },
    {
        name: "Vyonne Agustine Lim",
        shortName: "Vyonne",
        role: "Mandarin Chinese Teacher",
        subjects: "Bahasa Mandarin (汉语)",
        education: "S1 Pendidikan Bahasa Mandarin (中文教育学士)",
        experience: [
            "Guru sekolah minggu 主日学老师 (2024)"
        ],
        achievements: [
            "Peserta FLS2N bidang cipta lagu 全国学生艺术节歌曲创作参赛者 (2020)"
        ],
        image: "https://ui-avatars.com/api/?name=Vyonne+Lim&background=f59e0b&color=ffffff&size=200"
    },
    {
        name: "Mutiara Wulandari, S.Pd",
        shortName: "Mutiara",
        role: "Elementary & Calistung Teacher",
        subjects: "Calistung, Sekolah Dasar (SD)",
        education: "S1 Pendidikan Geografi",
        experience: [
            "Mengajar Geografi di SMA SWASTA PAB 8 Saentis (2023)",
            "Mengajar di Sekolah Dasar Negeri 112325 Kec. NA IX-X (2023)",
            "Mengajar IPS di SMP N 2 NA IX-X (2023)"
        ],
        achievements: [],
        image: "https://ui-avatars.com/api/?name=Mutiara+Wulandari&background=1e3a8a&color=ffffff&size=200"
    },
    {
        name: "Hanna Priskilla",
        shortName: "Hanna",
        role: "English Expert",
        subjects: "Bahasa Inggris",
        education: "D4 Teknologi Rekayasa Perangkat Lunak",
        experience: [
            "Mengajar di MAN IC Batam (English Short Course)",
            "Anggota Polibatam Community of Debate",
            "Anggota Polibatam English Club"
        ],
        achievements: [
            "Juara 1 Kategori Tour Guiding di Polibatam Grand Selection of NTVSC",
            "Juara 2 Kategori English Competence Tour Guiding di National Tourism Vocational Skills Competition Banyuwangi",
            "Juara 3 Desain Produk Profil Inovatif di KMIPN VI Jakarta (Kategori Hackathon)"
        ],
        image: "https://ui-avatars.com/api/?name=Hanna+Priskilla&background=f59e0b&color=ffffff&size=200"
    },
    {
        name: "Dita Aryani, S.Pd",
        shortName: "Dita",
        role: "Mathematics Teacher",
        subjects: "Matematika",
        education: "S1 Matematika",
        experience: [
            "Pengajar bimbel Ganesha Operation",
            "Pengajar bimbel Science Society",
            "Kampus mengajar KemendikbudRistek"
        ],
        achievements: [
            "Pemateri Seminar Nasional Matematika",
            "Peserta Olimpiade Fisika tingkat kota Batam"
        ],
        image: "https://ui-avatars.com/api/?name=Dita+Aryani&background=1e3a8a&color=ffffff&size=200"
    },
    {
        name: "Fitrah Nadia Rizqiyyah, S.Pd",
        shortName: "Fitrah",
        role: "Chemistry Expert",
        subjects: "Kimia",
        education: "S1 Pendidikan Kimia kelas International",
        experience: [
            "Guru Math & Science di Australian Intercultural School (AIS) Batam (2025-sekarang)",
            "Guru Kimia SMA Amanatul Ummah Surabaya (2021-2025)",
            "Asisten Laboratorium Universitas Negeri Surabaya (2019-2020)",
            "Program Magang Mengajar di Singapore International School (SIS) Medan (2019)"
        ],
        achievements: [
            "Menjadi Pembicara di Webinar Jaringan Internasional Global “Mengajar di Era Digital” - 2024",
            "Pembina Lomba Karya Tulis Siswa International WICE (Malaysia) - 2024",
            "Pembina Lomba Karya Tulis Siswa AISEEF (Undip) - 2024",
            "Pembina siswa Juara 3 KSM Kimia Kota Surabaya - 2024",
            "Juara 2 lomba DENTINE tingkat nasional - Unair 2015"
        ],
        image: "https://ui-avatars.com/api/?name=Fitrah+Nadia&background=f59e0b&color=ffffff&size=200"
    },
    {
        name: "Redafa Amorta Morda Ningrum",
        shortName: "Redafa",
        role: "English Debate Coach",
        subjects: "Bahasa Inggris",
        education: "D4 Teknik Mekatronika",
        experience: [
            "Mengajar di Maitreyawira (Private Tutor)",
            "Anggota Polibatam Community of Debate"
        ],
        achievements: [
            "Juara 1 Debat Bahasa Inggris Tingkat Nasional Aceh 2023",
            "Top 32 tim Debat Bahasa Inggris Pertamina Goes To Campus 2025",
            "Representasi LLDIKTI 17/Wilayah 1 di KDMI Tingkat Nasional 2024/2025"
        ],
        image: "https://ui-avatars.com/api/?name=Redafa+Amorta&background=1e3a8a&color=ffffff&size=200"
    }
];
