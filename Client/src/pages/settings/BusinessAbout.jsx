import { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { useRestaurant } from "../../hooks/useRestaurant";
import { upsertRestaurant } from "../../api/restaurants";
import { uploadImage } from "../../api/upload";
import {
  HiPhone,
  HiEnvelope,
  HiMapPin,
  HiTag,
  HiCheckCircle,
  HiExclamationCircle,
  HiPhoto,
  HiGlobeAlt,
  HiDocumentText,
  HiCloudArrowUp,
  HiXMark,
  HiPlus,
  HiSparkles,
  HiBuildingStorefront,
  HiInformationCircle,
  HiRectangleStack,
  HiStar,
  HiTrash,
} from "react-icons/hi2";

export default function BusinessAbout() {
  const { restaurantId } = useParams();
  const { user } = useAuth();
  const { restaurant, updateRestaurant } = useRestaurant();
  const [restaurantName, setRestaurantName] = useState("");
  const [description, setDescription] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [website, setWebsite] = useState("");
  const [socialMedia, setSocialMedia] = useState([]);
  const [logo, setLogo] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [featuredImage, setFeaturedImage] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [imagePreviews, setImagePreviews] = useState({});
  const [processingImages, setProcessingImages] = useState({});

  const logoInputRef = useRef(null);
  const coverInputRef = useRef(null);
  const featuredInputRef = useRef(null);

  const resizeImage = (file, maxWidth, maxHeight) => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        let { width, height } = img;

        if (width > height) {
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = (width * maxHeight) / height;
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;

        ctx.drawImage(img, 0, 0, width, height);

        const base64Data = canvas.toDataURL(file.type, 0.8);
        resolve(base64Data);
      };

      img.src = URL.createObjectURL(file);
    });
  };

  const handleImageSelect = async (file, imageType) => {
    if (!file) return;

    setProcessingImages(prev => ({ ...prev, [imageType]: true }));

    try {
      let processedFile = file;

      switch (imageType) {
        case 'logo':
          processedFile = await resizeImage(file, 200, 200);
          break;
        case 'cover':
          processedFile = await resizeImage(file, 1200, 400);
          break;
        case 'featured':
          processedFile = await resizeImage(file, 800, 600);
          break;
      }

      const previewUrl = processedFile;
      setImagePreviews(prev => ({ 
        ...prev, 
        [imageType]: previewUrl,
        [`${imageType}Data`]: processedFile 
      }));
      await handleImageUpload(imageType, processedFile);

    } catch (error) {
      console.error(`Error processing ${imageType}:`, error);
      setMessage(`Failed to process ${imageType} image`);
    } finally {
      setProcessingImages(prev => ({ ...prev, [imageType]: false }));
    }
  };

  useEffect(() => {
    if (restaurant) {
      setRestaurantName(restaurant.name || "");
      setDescription(restaurant.description || "");
      setAddress(restaurant.address || "");
      setPhone(restaurant.phone || "");
      setEmail(restaurant.email || "");
      setWebsite(restaurant.website || "");

      let socialMediaData = [];
      if (restaurant.socialMedia) {
        if (Array.isArray(restaurant.socialMedia)) {
          socialMediaData = restaurant.socialMedia;
        } else {
          const oldFormat = restaurant.socialMedia;
          if (oldFormat.facebook) {
            socialMediaData.push({
              name: "Facebook",
              url: oldFormat.facebook,
              svgIcon: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" fill="#1877F2"/>
</svg>`
            });
          }
          if (oldFormat.instagram) {
            socialMediaData.push({
              name: "Instagram",
              url: oldFormat.instagram,
              svgIcon: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<rect x="2" y="2" width="20" height="20" rx="5" ry="5" stroke="url(#instagram-gradient)" stroke-width="2"/>
<circle cx="18" cy="6" r="1.5" fill="url(#instagram-gradient)"/>
<path d="M12 7.5c-2.485 0-4.5 2.015-4.5 4.5s2.015 4.5 4.5 4.5 4.5-2.015 4.5-4.5-2.015-4.5-4.5-4.5zm0 7.5c-1.657 0-3-1.343-3-3s1.343-3 3-3 3 1.343 3 3-1.343 3-3 3z" fill="url(#instagram-gradient)"/>
<defs>
<linearGradient id="instagram-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
<stop offset="0%" style="stop-color:#833ab4"/>
<stop offset="50%" style="stop-color:#fd1d1d"/>
<stop offset="100%" style="stop-color:#fcb045"/>
</linearGradient>
</defs>
</svg>`
            });
          }
          if (oldFormat.twitter) {
            socialMediaData.push({
              name: "Twitter",
              url: oldFormat.twitter,
              svgIcon: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" fill="#1DA1F2"/>
</svg>`
            });
          }
          if (oldFormat.tiktok) {
            socialMediaData.push({
              name: "TikTok",
              url: oldFormat.tiktok,
              svgIcon: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" fill="#000000"/>
</svg>`
            });
          }
        }
      }
      setSocialMedia(socialMediaData);

      setLogo(restaurant.logo || "");
      setCoverImage(restaurant.coverImage || "");
      setFeaturedImage(restaurant.featuredImage || "");
    }
  }, [restaurant]);

  const handleImageUpload = async (imageType, base64Data = null) => {
    const dataToUpload = base64Data || imagePreviews[`${imageType}Data`];
    if (!dataToUpload) {
      console.error(`No base64 data found for ${imageType}`);
      setMessage(`No data to upload for ${imageType}`);
      return;
    }
    try {
      const result = await uploadImage(dataToUpload);
      if (result && result.url) {
        const imageUrl = result.url;
        switch (imageType) {
          case 'logo':
            setLogo(imageUrl);
            break;
          case 'cover':
            setCoverImage(imageUrl);
            break;
          case 'featured':
            setFeaturedImage(imageUrl);
            break;
        }

        setImagePreviews(prev => {
          const newPreviews = { ...prev };
          delete newPreviews[imageType];
          delete newPreviews[`${imageType}Data`];
          return newPreviews;
        });

        setMessage(`${imageType.charAt(0).toUpperCase() + imageType.slice(1)} uploaded successfully!`);
        setTimeout(() => setMessage(""), 3000);
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error) {
      console.error(`Error uploading ${imageType}:`, error);
      setMessage(`Failed to upload ${imageType}: ${error.message || 'Unknown error'}`);
    } finally {
      setProcessingImages(prev => ({ ...prev, [imageType]: false }));
    }
  };

  const handleSocialMediaChange = (index, field, value) => {
    setSocialMedia(prev => prev.map((item, i) =>
      i === index ? { ...item, [field]: value } : item
    ));
  };

  const addSocialMedia = () => {
    setSocialMedia(prev => [...prev, { name: "", url: "", svgIcon: "" }]);
  };

  const removeSocialMedia = (index) => {
    setSocialMedia(prev => prev.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    if (!restaurantName.trim()) {
      setMessage("Restaurant name cannot be empty");
      return;
    }

    setSaving(true);
    setMessage("");

    try {
      const token = await user.getIdToken();
      const updateData = {
        name: restaurantName,
        description,
        address,
        phone,
        email,
        website,
        socialMedia,
        logo,
        coverImage,
        featuredImage,
      };
      await upsertRestaurant(restaurantId, updateData, token);
      setMessage("Restaurant information updated successfully!");
      setTimeout(() => setMessage(""), 4000);
      updateRestaurant(updateData);
    } catch (err) {
      console.error("Error updating restaurant:", err);
      setMessage("Failed to update restaurant information");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-8 bg-gray-50 min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-2">
          Business Information
        </h1>
        <p className="text-gray-600">
          Manage your restaurant's profile and branding.
        </p>
      </div>

      {message && (
        <div className="mb-4 animate-fade-in">
          <div
            className={`p-4 rounded-xl shadow-lg border-l-4 backdrop-blur-sm ${
              message.includes("success")
                ? "bg-green-50/80 text-green-800 border-green-500 shadow-green-100"
                : "bg-red-50/80 text-red-800 border-red-500 shadow-red-100"
            }`}
          >
            <div className="flex items-start gap-3">
              <div className={`p-1.5 rounded-lg ${
                message.includes("success") ? "bg-green-100" : "bg-red-100"
              }`}>
                {message.includes("success") ? (
                  <HiCheckCircle className="w-5 h-5 text-green-600" />
                ) : (
                  <HiExclamationCircle className="w-5 h-5 text-red-600" />
                )}
              </div>
              <div className="flex-1">
                <p className="font-medium text-sm">{message}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1  gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-full lg:max-w-6xl mx-auto">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Basic Information</h2>
              <div className="group">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2 group-hover:text-blue-600 transition-colors">
                  <HiTag className="w-4 h-4 text-blue-500" />
                  Restaurant Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={restaurantName}
                    onChange={(e) => setRestaurantName(e.target.value)}
                    className="w-full pl-10 pr-3 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all text-gray-800 bg-gray-50/50 hover:bg-white"
                    placeholder="Enter restaurant name"
                  />
                  <HiTag className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                </div>
              </div>

              {/* Contact Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="group">
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2 group-hover:text-blue-600 transition-colors">
                    <HiPhone className="w-4 h-4 text-blue-500" />
                    Phone Number
                  </label>
                  <div className="relative">
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full pl-10 pr-3 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all text-gray-800 bg-gray-50/50 hover:bg-white"
                      placeholder="+1 (404) 123-4567"
                    />
                    <HiPhone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  </div>
                </div>

                <div className="group">
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2 group-hover:text-blue-600 transition-colors">
                    <HiEnvelope className="w-4 h-4 text-blue-500" />
                    Email Address
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 pr-3 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all text-gray-800 bg-gray-50/50 hover:bg-white"
                      placeholder="contact@restaurant.com"
                    />
                    <HiEnvelope className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  </div>
                </div>
              </div>

              <div className="group">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2 group-hover:text-blue-600 transition-colors">
                  <HiMapPin className="w-4 h-4 text-blue-500" />
                  Address
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full pl-10 pr-3 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all text-gray-800 bg-gray-50/50 hover:bg-white"
                    placeholder="75 5th Street NW, Atlanta, GA 30308"
                  />
                  <HiMapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                </div>
                <p className="text-xs text-gray-500 mt-1 ml-10">This address will be visible to your customers</p>
              </div>

              <div className="group">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2 group-hover:text-blue-600 transition-colors">
                  <HiDocumentText className="w-4 h-4 text-blue-500" />
                  Description
                </label>
                <div className="relative">
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                    className="w-full pl-10 pr-3 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all text-gray-800 bg-gray-50/50 hover:bg-white resize-vertical"
                    placeholder="Tell customers about your restaurant, cuisine, atmosphere, and what makes you special..."
                  />
                  <HiDocumentText className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                </div>
                <p className="text-xs text-gray-500 mt-1 ml-10">This description will be displayed on your public shop page</p>
              </div>

              <div className="group">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2 group-hover:text-blue-600 transition-colors">
                  <HiGlobeAlt className="w-4 h-4 text-blue-500" />
                  Website
                </label>
                <div className="relative">
                  <input
                    type="url"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    className="w-full pl-10 pr-3 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all text-gray-800 bg-gray-50/50 hover:bg-white"
                    placeholder="https://yourrestaurant.com"
                  />
                  <HiGlobeAlt className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-full lg:max-w-6xl mx-auto">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Social Media Links</h2>

              <div className="p-4 space-y-4">
                <div className="flex items-center justify-between gap-4 flex-nowrap">
                  <p className="text-sm text-gray-600 whitespace-nowrap">Connect your social media profiles</p>
                  <button
                    onClick={addSocialMedia}
                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <HiPlus className="w-4 h-4 mr-2" />
                    Add Social Media
                  </button>
                </div>

                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>Tip:</strong> Get beautiful SVG icons for your social media links from{" "}
                    <a
                      href="https://nucleoapp.com/social-media-icons"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 underline font-medium"
                    >
                      nucleoapp.com/social-media-icons
                    </a>
                    . Copy the SVG code and paste it in the "SVG Icon" field.
                  </p>
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <HiSparkles className="w-4 h-4 text-yellow-500" />
                    Quick Add Popular Platforms
                  </h4>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setSocialMedia(prev => [...prev, {
                        name: "Facebook",
                        url: "https://www.facebook.com/",
                        svgIcon: `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32"><path d="M16,2c-7.732,0-14,6.268-14,14,0,6.566,4.52,12.075,10.618,13.588v-9.31h-2.887v-4.278h2.887v-1.843c0-4.765,2.156-6.974,6.835-6.974,.887,0,2.417,.174,3.043,.348v3.878c-.33-.035-.904-.052-1.617-.052-2.296,0-3.183,.87-3.183,3.13v1.513h4.573l-.786,4.278h-3.787v9.619c6.932-.837,12.304-6.74,12.304-13.897,0-7.732-6.268-14-14-14Z"></path></svg>`
                      }])}
                      className="flex items-center justify-center w-20 p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      title="Add Facebook"
                    >
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" fill="#ffffff"/>
                      </svg>
                    </button>

                    <button
                      onClick={() => setSocialMedia(prev => [...prev, {
                        name: "Instagram",
                        url: "https://www.instagram.com/",
                        svgIcon: `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32"><path d="M10.202,2.098c-1.49,.07-2.507,.308-3.396,.657-.92,.359-1.7,.84-2.477,1.619-.776,.779-1.254,1.56-1.61,2.481-.345,.891-.578,1.909-.644,3.4-.066,1.49-.08,1.97-.073,5.771s.024,4.278,.096,5.772c.071,1.489,.308,2.506,.657,3.396,.359,.92,.84,1.7,1.619,2.477,.779,.776,1.559,1.253,2.483,1.61,.89,.344,1.909,.579,3.399,.644,1.49,.065,1.97,.081,5.771,.073,3.801-.007,4.279-.024,5.773-.095s2.505-.309,3.395-.657c.92-.36,1.701-.84,2.477-1.62s1.254-1.561,1.609-2.483c.345-.89,.579-1.909,.644-3.398,.065-1.494,.081-1.971,.073-5.773s-.024-4.278-.095-5.771-.308-2.507-.657-3.397c-.36-.92-.84-1.7-1.619-2.477s-1.561-1.254-2.483-1.609c-.891-.345-1.909-.58-3.399-.644s-1.97-.081-5.772-.074-4.278,.024-5.771,.096m.164,25.309c-1.365-.059-2.106-.286-2.6-.476-.654-.252-1.12-.557-1.612-1.044s-.795-.955-1.05-1.608c-.192-.494-.423-1.234-.487-2.599-.069-1.475-.084-1.918-.092-5.656s.006-4.18,.071-5.656c.058-1.364,.286-2.106,.476-2.6,.252-.655,.556-1.12,1.044-1.612s.955-.795,1.608-1.05c.493-.193,1.234-.422,2.598-.487,1.476-.07,1.919-.084,5.656-.092,3.737-.008,4.181,.006,5.658,.071,1.364,.059,2.106,.285,2.599,.476,.654,.252,1.12,.555,1.612,1.044s.795,.954,1.051,1.609c.193,.492,.422,1.232,.486,2.597,.07,1.476,.086,1.919,.093,5.656,.007,3.737-.006,4.181-.071,5.656-.06,1.365-.286,2.106-.476,2.601-.252,.654-.556,1.12-1.045,1.612s-.955,.795-1.608,1.05c-.493,.192-1.234,.422-2.597,.487-1.476,.069-1.919,.084-5.657,.092s-4.18-.007-5.656-.071M21.779,8.517c.002,.928,.755,1.679,1.683,1.677s1.679-.755,1.677-1.683c-.002-.928-.755-1.679-1.683-1.677,0,0,0,0,0,0-.928,.002-1.678,.755-1.677,1.683m-12.967,7.496c.008,3.97,3.232,7.182,7.202,7.174s7.183-3.232,7.176-7.202c-.008-3.97-3.233-7.183-7.203-7.175s-7.182,3.233-7.174,7.203m2.522-.005c-.005-2.577,2.08-4.671,4.658-4.676,2.577-.005,4.671,2.08,4.676,4.658,.005,2.577-2.08,4.671-4.658,4.676-2.577,.005-4.671-2.079-4.676-4.656h0"></path></svg>`
                      }])}
                      className="flex items-center justify-center w-20 p-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors"
                      title="Add Instagram"
                    >
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect x="2" y="2" width="20" height="20" rx="5" ry="5" stroke="#ffffff" strokeWidth="2"/>
                        <circle cx="18" cy="6" r="1.5" fill="#ffffff"/>
                        <path d="M12 7.5c-2.485 0-4.5 2.015-4.5 4.5s2.015 4.5 4.5 4.5 4.5-2.015 4.5-4.5-2.015-4.5-4.5-4.5zm0 7.5c-1.657 0-3-1.343-3-3s1.343-3 3-3 3 1.343 3 3-1.343 3-3 3z" fill="#ffffff"/>
                      </svg>
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  {(socialMedia || []).map((social, index) => (
                    <div key={index} className="flex items-center gap-4 p-4 border border-gray-200 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
                      <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Platform Name
                          </label>
                          <input
                            type="text"
                            value={social.name}
                            onChange={(e) => handleSocialMediaChange(index, 'name', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                            placeholder="Facebook, Instagram, etc."
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            URL
                          </label>
                          <input
                            type="url"
                            value={social.url}
                            onChange={(e) => handleSocialMediaChange(index, 'url', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                            placeholder="https://..."
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            SVG Icon
                          </label>
                          <textarea
                            value={social.svgIcon}
                            onChange={(e) => handleSocialMediaChange(index, 'svgIcon', e.target.value)}
                            rows={2}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-xs font-mono"
                            placeholder="<svg>...</svg>"
                          />
                        </div>
                      </div>
                      <button
                        onClick={() => removeSocialMedia(index)}
                        className="flex items-center px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                      >
                        <HiXMark className="w-4 h-4 mr-2" />
                        Remove
                      </button>
                    </div>
                  ))}

                  {(socialMedia || []).length === 0 && (
                    <div className="text-center py-12 text-gray-500">
                      <HiGlobeAlt className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                      <p className="text-lg font-medium">No social media links added yet.</p>
                      <p className="text-sm mt-1">Click "Add Social Media" to get started.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-full lg:max-w-6xl mx-auto">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Images & Branding</h2>

              <div className="space-y-6">
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-5 border border-blue-100 hover:shadow-lg transition-all duration-300">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-blue-500 rounded-lg">
                      <HiPhoto className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-800">Restaurant Logo</h3>
                      <p className="text-sm text-gray-600">Your brand identity</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="relative group">
                      <div className="w-28 h-28 border-2 border-dashed border-blue-300 rounded-2xl flex items-center justify-center overflow-hidden bg-white hover:bg-blue-50 transition-all duration-300 shadow-sm hover:shadow-md">
                        {processingImages.logo ? (
                          <div className="flex flex-col items-center justify-center">
                            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mb-2"></div>
                            <span className="text-xs text-blue-600 font-medium">Processing...</span>
                          </div>
                        ) : imagePreviews.logo ? (
                          <img src={imagePreviews.logo} alt="Logo Preview" className="w-full h-full object-cover" />
                        ) : logo ? (
                          <img src={logo} alt="Logo" className="w-full h-full object-cover" />
                        ) : (
                          <div className="flex flex-col items-center justify-center">
                            <HiPhoto className="w-12 h-12 text-blue-400 mb-1" />
                            <span className="text-xs text-blue-600 font-medium">Logo</span>
                          </div>
                        )}
                      </div>
                      {(logo || imagePreviews.logo) && (
                        <div className="absolute -top-2 -right-2 bg-green-500 rounded-full p-1">
                          <HiCheckCircle className="w-4 h-4 text-white" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 space-y-3">
                      <div className="flex gap-3">
                        <input
                          ref={logoInputRef}
                          type="file"
                          accept="image/*"
                          onChange={(e) => e.target.files[0] && handleImageSelect(e.target.files[0], 'logo')}
                          className="hidden"
                        />
                        <button
                          onClick={() => logoInputRef.current?.click()}
                          className="px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 flex items-center gap-2 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
                        >
                          <HiCloudArrowUp className="w-4 h-4" />
                          {imagePreviews.logo ? 'Change ' : logo ? 'Change ' : 'Upload Logo'}
                        </button>

                        {imagePreviews.logo && (
                          <button
                            onClick={() => {
                              setImagePreviews(prev => {
                                const newPreviews = { ...prev };
                                delete newPreviews.logo;
                                delete newPreviews.logoData;
                                return newPreviews;
                              });
                              if (logoInputRef.current) logoInputRef.current.value = '';
                            }}
                            className="px-3 py-2 bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 flex items-center gap-1.5 transition-all"
                          >
                            <HiXMark className="w-4 h-4" />
                            Cancel
                          </button>
                        )}

                        {logo && !imagePreviews.logo && (
                          <button
                            onClick={() => setLogo("")}
                            className="px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 flex items-center gap-1.5 transition-all"
                          >
                            <HiTrash className="w-4 h-4" />
                            Remove
                          </button>
                        )}
                      </div>

                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <div className="flex items-start gap-2">
                          <HiInformationCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="text-sm text-blue-800 font-medium">Recommended specs:</p>
                            <p className="text-xs text-blue-700 mt-1">Square image, minimum 200×200px. PNG or JPG format. Will be automatically resized for optimal performance.</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-5 border border-purple-100 hover:shadow-lg transition-all duration-300">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-purple-500 rounded-lg">
                      <HiRectangleStack className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-800">Cover Image</h3>
                      <p className="text-sm text-gray-600">Hero banner for your shop</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="relative group">
                      <div className="w-48 h-28 border-2 border-dashed border-purple-300 rounded-2xl flex items-center justify-center overflow-hidden bg-white hover:bg-purple-50 transition-all duration-300 shadow-sm hover:shadow-md">
                        {processingImages.cover ? (
                          <div className="flex flex-col items-center justify-center">
                            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-600 mb-2"></div>
                            <span className="text-xs text-purple-600 font-medium">Processing...</span>
                          </div>
                        ) : imagePreviews.cover ? (
                          <img src={imagePreviews.cover} alt="Cover Preview" className="w-full h-full object-cover" />
                        ) : coverImage ? (
                          <img src={coverImage} alt="Cover" className="w-full h-full object-cover" />
                        ) : (
                          <div className="flex flex-col items-center justify-center">
                            <HiRectangleStack className="w-12 h-12 text-purple-400 mb-1" />
                            <span className="text-xs text-purple-600 font-medium">Cover</span>
                          </div>
                        )}
                      </div>
                      {(coverImage || imagePreviews.cover) && (
                        <div className="absolute -top-2 -right-2 bg-green-500 rounded-full p-1">
                          <HiCheckCircle className="w-4 h-4 text-white" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 space-y-3">
                      <div className="flex gap-3">
                        <input
                          ref={coverInputRef}
                          type="file"
                          accept="image/*"
                          onChange={(e) => e.target.files[0] && handleImageSelect(e.target.files[0], 'cover')}
                          className="hidden"
                        />
                        <button
                          onClick={() => coverInputRef.current?.click()}
                          className="px-4 py-2.5 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl hover:from-purple-700 hover:to-purple-800 flex items-center gap-2 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
                        >
                          <HiCloudArrowUp className="w-4 h-4" />
                          {imagePreviews.cover ? 'Change ' : coverImage ? 'Change ' : 'Upload Cover'}
                        </button>

                        {imagePreviews.cover && (
                          <button
                            onClick={() => {
                              setImagePreviews(prev => {
                                const newPreviews = { ...prev };
                                delete newPreviews.cover;
                                delete newPreviews.coverData;
                                return newPreviews;
                              });
                              if (coverInputRef.current) coverInputRef.current.value = '';
                            }}
                            className="px-3 py-2 bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 flex items-center gap-1.5 transition-all"
                          >
                            <HiXMark className="w-4 h-4" />
                            Cancel
                          </button>
                        )}

                        {coverImage && !imagePreviews.cover && (
                          <button
                            onClick={() => setCoverImage("")}
                            className="px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 flex items-center gap-1.5 transition-all"
                          >
                            <HiTrash className="w-4 h-4" />
                            Remove
                          </button>
                        )}
                      </div>

                      <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                        <div className="flex items-start gap-2">
                          <HiInformationCircle className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="text-sm text-purple-800 font-medium">Recommended specs:</p>
                            <p className="text-xs text-purple-700 mt-1">Landscape image, minimum 1200×400px. Will be displayed as header on your shop page and automatically resized for optimal performance.</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Featured Image Section */}
                <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-5 border border-emerald-100 hover:shadow-lg transition-all duration-300">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-emerald-500 rounded-lg">
                      <HiStar className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-800">Featured Image</h3>
                      <p className="text-sm text-gray-600">Showcase your best dishes</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="relative group">
                      <div className="w-48 h-28 border-2 border-dashed border-emerald-300 rounded-2xl flex items-center justify-center overflow-hidden bg-white hover:bg-emerald-50 transition-all duration-300 shadow-sm hover:shadow-md">
                        {processingImages.featured ? (
                          <div className="flex flex-col items-center justify-center">
                            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-600 mb-2"></div>
                            <span className="text-xs text-emerald-600 font-medium">Processing...</span>
                          </div>
                        ) : imagePreviews.featured ? (
                          <img src={imagePreviews.featured} alt="Featured Preview" className="w-full h-full object-cover" />
                        ) : featuredImage ? (
                          <img src={featuredImage} alt="Featured" className="w-full h-full object-cover" />
                        ) : (
                          <div className="flex flex-col items-center justify-center">
                            <HiStar className="w-12 h-12 text-emerald-400 mb-1" />
                            <span className="text-xs text-emerald-600 font-medium">Featured</span>
                          </div>
                        )}
                      </div>
                      {(featuredImage || imagePreviews.featured) && (
                        <div className="absolute -top-2 -right-2 bg-green-500 rounded-full p-1">
                          <HiCheckCircle className="w-4 h-4 text-white" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 space-y-3">
                      <div className="flex gap-3">
                        <input
                          ref={featuredInputRef}
                          type="file"
                          accept="image/*"
                          onChange={(e) => e.target.files[0] && handleImageSelect(e.target.files[0], 'featured')}
                          className="hidden"
                        />
                        <button
                          onClick={() => featuredInputRef.current?.click()}
                          className="px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-xl hover:from-emerald-700 hover:to-emerald-800 flex items-center gap-2 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
                        >
                          <HiCloudArrowUp className="w-4 h-4" />
                          {imagePreviews.featured ? 'Change ' : featuredImage ? 'Change ' : 'Upload Featured'}
                        </button>

                        {imagePreviews.featured && (
                          <button
                            onClick={() => {
                              setImagePreviews(prev => {
                                const newPreviews = { ...prev };
                                delete newPreviews.featured;
                                delete newPreviews.featuredData;
                                return newPreviews;
                              });
                              if (featuredInputRef.current) featuredInputRef.current.value = '';
                            }}
                            className="px-3 py-2 bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 flex items-center gap-1.5 transition-all"
                          >
                            <HiXMark className="w-4 h-4" />
                            Cancel
                          </button>
                        )}

                        {featuredImage && !imagePreviews.featured && (
                          <button
                            onClick={() => setFeaturedImage("")}
                            className="px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 flex items-center gap-1.5 transition-all"
                          >
                            <HiTrash className="w-4 h-4" />
                            Remove
                          </button>
                        )}
                      </div>

                      <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3">
                        <div className="flex items-start gap-2">
                          <HiInformationCircle className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="text-sm text-emerald-800 font-medium">Optional showcase:</p>
                            <p className="text-xs text-emerald-700 mt-1">Showcase your best dishes or restaurant interior. Will be featured prominently on your shop page and automatically resized to 800×600px for optimal performance.</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Save Button Card */}
          <div className="lg:col-span-3 mt-6">
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden hover:shadow-2xl transition-all duration-300">
              <div className="p-4">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="w-full px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white font-bold text-base rounded-xl hover:from-red-700 hover:to-red-800 disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-red-200 transition-all transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  {saving ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Saving Changes...
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-2">
                      <HiCheckCircle className="w-5 h-5" />
                      Save Changes
                    </div>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
    </div>
  );
}
