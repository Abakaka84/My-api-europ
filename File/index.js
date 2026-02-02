const express = require("express");
const cors = require("cors");
const axios = require("axios"); 
const app = express();

app.use(cors());
app.use(express.json());
// لضمان الحصول على IP الحقيقي خلف Render
app.set('trust proxy', true); 

// قائمة رموز الدول المسموح بها (أوروبا، أمريكا الشمالية، أستراليا)
const allowedRegions = [
    "US", "CA", "MX", // أمريكا الشمالية
    "AU", "NZ",      // أستراليا/نيوزيلندا
    "AT", "BE", "BG", "HR", "CY", "CZ", "DK", "EE", "FI", "FR", "DE", "GR", 
    "HU", "IE", "IT", "LV", "LT", "LU", "MT", "NL", "PL", "PT", "RO", "SK", 
    "SI", "ES", "SE", "IS", "LI", "NO" // أوروبا
];

// بيانات الفنادق (نموذجية)
const hotels = [
  { name: "Hilton Cairo", city: "Cairo", country: "Egypt", rating: 4.5 },
  { name: "Radisson Blu", city: "N'Djamena", country: "Chad", rating: 4.0 },
  { name: "Hyatt Regency Sydney", city: "Sydney", country: "Australia", rating: 4.8 },
  { name: "The Plaza New York", city: "New York", country: "USA", rating: 5.0 }
];

// مفتاح API الخاص بك لخدمة الموقع الجغرافي (قم بتحديث هذا الحقل)
const GEOLOCATION_API_KEY = "YOUR_ABSTRACT_API_KEY"; 

// مسار لجلب الفنادق مع التحقق من الموقع الجغرافي
app.get("/hotels", async (req, res) => {
  const { city } = req.query;
  const clientIp = req.ip; 

  try {
    const geoResponse = await axios.get(`https://ipgeolocation.abstractapi.com{GEOLOCATION_API_KEY}&ip_address=${clientIp}`);
    const { country_code } = geoResponse.data;

    // التحقق مما إذا كان العميل من إحدى المناطق المسموح بها
    if (allowedRegions.includes(country_code)) {
        const filtered = city 
            ? hotels.filter(h => h.city.toLowerCase().includes(city.toLowerCase()))
            : hotels;
        console.log(`Request from allowed region (${country_code}): Serving data.`);
        return res.json(filtered);
    } else {
        console.log(`Request from unauthorized region (${country_code}): Blocked.`);
        return res.status(403).send("Service unavailable in your region.");
    }

  } catch (error) {
    console.error("Error during geolocation lookup:", error.message);
    const filtered = city 
            ? hotels.filter(h => h.city.toLowerCase().includes(city.toLowerCase()))
            : hotels;
    res.json(filtered);
  }
});

// تشغيل السيرفر على أي بورت متاح
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
