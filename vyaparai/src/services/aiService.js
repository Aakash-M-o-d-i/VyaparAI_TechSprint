/**
 * AI Service - Gemini API Integration + Puter.js
 * Handles text understanding and poster/caption generation
 */
import { geminiModel, imageGenModel } from '../config/gemini';

/**
 * Parse user input AND enhance it using Puter.js (free) or Gemini
 * Returns both extracted data and an enhanced promotional description
 */
export async function parseUserInput(rawInput, language) {
    const languageMap = {
        en: 'English',
        hi: 'Hindi',
        ta: 'Tamil'
    };

    const prompt = `You are an expert AI marketing copywriter helping local Indian business owners create AMAZING promotional content.

IMPORTANT: Even if the user gives just 2-3 words, you MUST create a DETAILED, LONG, and COMPELLING promotional content!

The input is in ${languageMap[language] || 'English'}.
User Input: "${rawInput}"

Your task:
1. Understand what the user is trying to promote (even from minimal input)
2. Create a RICH, DETAILED promotional content that would make any customer excited!

Return a JSON object with this EXACT structure:
{
  "product": "the main product or service (be specific, e.g., 'Fresh Mango Juice' not just 'juice')",
  "price": "the price if mentioned (with ₹ symbol), or suggest a reasonable price like '₹40 only'",
  "offer": "the offer if mentioned, or create an attractive one like 'Buy 2 Get 1 Free'",
  "businessType": "infer the business type (e.g., Juice Shop, Cafe, Restaurant, Salon, etc.)",
  "enhancedPrompt": {
    "headline": "A POWERFUL, catchy headline (5-8 words) that grabs attention immediately in ${languageMap[language] || 'English'}",
    "tagline": "An emotional, desire-creating tagline (8-12 words) in ${languageMap[language] || 'English'}",
    "offerHighlight": "Present the offer in an EXCITING way with urgency (15-20 words) in ${languageMap[language] || 'English'}",
    "detailedFeatures": [
      "Feature 1: A compelling benefit or quality point (one sentence)",
      "Feature 2: Why customers should choose this (one sentence)", 
      "Feature 3: What makes it special or unique (one sentence)",
      "Feature 4: Additional value or guarantee (one sentence)"
    ],
    "fullDescription": "A DETAILED 4-5 sentence promotional paragraph in ${languageMap[language] || 'English'} that: (1) Creates excitement, (2) Highlights the product quality, (3) Mentions the amazing value, (4) Creates urgency, (5) Ends with an invitation to visit. Make it sound like a professional advertisement!",
    "callToAction": "A STRONG, urgent call to action (5-8 words) in ${languageMap[language] || 'English'}"
  }
}

REMEMBER: 
- Be CREATIVE and DETAILED even if input is short!
- Make it sound like a PREMIUM advertisement
- Use emotional, persuasive language
- The fullDescription MUST be 4-5 complete sentences
- Return ONLY valid JSON, no additional text.`;

    // Try Puter.js first (free, no API key), then fall back to Gemini
    let responseText = null;

    try {
        // Check if Puter.js is available
        if (typeof window !== 'undefined' && window.puter && window.puter.ai) {
            console.log('🚀 Using Puter.js for prompt enhancement...');
            const result = await window.puter.ai.chat(prompt);

            // Handle different response formats from Puter.js
            if (typeof result === 'string') {
                responseText = result;
            } else if (result?.message?.content) {
                responseText = result.message.content;
            } else if (result?.content) {
                responseText = result.content;
            } else if (result?.text) {
                responseText = result.text;
            } else {
                responseText = JSON.stringify(result);
            }
            console.log('✅ Puter.js prompt enhancement successful!');
        } else {
            throw new Error('Puter.js not available');
        }
    } catch (puterError) {
        console.warn('Puter.js failed, trying Gemini:', puterError.message);
        try {
            const result = await geminiModel.generateContent(prompt);
            responseText = result.response.text();
            console.log('✅ Gemini prompt enhancement successful!');
        } catch (geminiError) {
            console.error('Gemini also failed:', geminiError.message);
            throw geminiError;
        }
    }

    try {
        // Extract JSON from response
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0]);
            return {
                product: parsed.product || '',
                price: parsed.price || '',
                offer: parsed.offer || '',
                businessType: parsed.businessType || 'Shop',
                enhancedPrompt: parsed.enhancedPrompt || {
                    headline: parsed.product || rawInput,
                    tagline: 'Experience the best quality at unbeatable prices!',
                    offerHighlight: parsed.offer || '🎉 Special limited-time offer just for you! Don\'t miss out on this amazing deal!',
                    detailedFeatures: [
                        '✓ Premium quality products sourced with care',
                        '✓ Unbeatable prices that fit your budget',
                        '✓ Trusted by hundreds of happy customers',
                        '✓ Fresh and authentic guaranteed'
                    ],
                    fullDescription: `Discover the finest ${parsed.product || 'products'} that will exceed your expectations! We take pride in offering only the best quality at prices that won't break the bank. Our customers love us for our commitment to excellence and value. Whether you're treating yourself or your loved ones, this is the perfect choice. Visit us today and experience the difference - you won't be disappointed!`,
                    callToAction: 'Visit us today - Limited time offer!'
                }
            };
        }

        throw new Error('Could not parse AI response');
    } catch (error) {
        console.error('Parse input error:', error);
        // Return default structure if parsing fails
        return {
            product: rawInput.split(' ').slice(0, 3).join(' '),
            price: '',
            offer: '',
            businessType: 'Shop',
            enhancedPrompt: {
                headline: `Amazing ${rawInput} - Don't Miss Out!`,
                tagline: 'Premium quality that you deserve at prices you\'ll love!',
                offerHighlight: '🎁 Special offer available for a limited time only! Grab yours before it\'s gone!',
                detailedFeatures: [
                    '✓ Top-notch quality you can trust',
                    '✓ Best prices in the market guaranteed',
                    '✓ Loved by our loyal customers',
                    '✓ 100% satisfaction promised'
                ],
                fullDescription: `Looking for the best ${rawInput}? You've come to the right place! We offer premium quality products that are carefully selected to meet your highest standards. Our unbeatable prices mean you get amazing value without compromising on quality. Thousands of happy customers trust us for their needs. Come visit us today and see why we're the preferred choice in town!`,
                callToAction: 'Hurry! Visit us today!'
            }
        };
    }
}

/**
 * Generate promotional poster image and captions
 * Uses Puter.js for text generation (free) and Gemini for image generation
 */
export async function generatePosterAndCaptions(promotionData) {
    const { product, price, offer, businessType, language, style } = promotionData;

    const languageMap = {
        en: 'English',
        hi: 'Hindi',
        ta: 'Tamil'
    };

    const styleDescriptions = {
        friendly: 'warm, welcoming, and approachable with soft green colors and friendly vibes',
        festive: 'celebratory, vibrant, and colorful with festive decorations and bright colors',
        offerFocused: 'bold, attention-grabbing with prominent red/orange colors and urgency feel',
        localStyle: 'traditional, authentic Indian local market style with warm earthy colors'
    };

    // Generate captions first
    const captionPrompt = `You are an AI marketing assistant for small local Indian businesses.

Generate promotional captions based on:
- Business Type: ${businessType}
- Product: ${product}
- Price: ${price}
- Offer: ${offer || 'No special offer'}
- Language: ${languageMap[language] || 'English'}
- Style: ${style} (${styleDescriptions[style] || 'friendly'})

IMPORTANT: All text MUST be in ${languageMap[language] || 'English'} ONLY. Do NOT include any English words if the language is not English.

Generate captions for:

1. WhatsApp Caption (5-6 lines):
- Start with an attention-grabbing emoji line
- Mention the product and offer clearly
- Add urgency or excitement
- Include a call-to-action
- End with shop location/contact hint
- Use 3-5 relevant emojis throughout

2. Instagram Caption (5-6 lines):
- Start with a catchy hook line with emojis
- Describe the product/offer creatively
- Add a relatable or fun line
- Include a strong call-to-action
- End with 5-8 relevant hashtags in ${languageMap[language]}
- Make it engaging and shareable

3. Facebook Caption (5-6 lines):
- Start with a warm greeting or announcement
- Highlight the product and special offer
- Add value proposition (why customers should care)
- Include testimonial-style line or social proof
- End with call-to-action and invitation
- Use 2-3 emojis for visual appeal

Format your response EXACTLY as:
POSTER_TEXT:
[Headline text for poster]
[Price line]
[Offer line if applicable]

WHATSAPP:
[5-6 line creative caption with emojis]

INSTAGRAM:
[5-6 line creative caption with hashtags]

FACEBOOK:
[5-6 line creative caption]`;

    try {
        // Generate captions - try Puter.js first (free), then Gemini
        let captionResponse;

        try {
            if (typeof window !== 'undefined' && window.puter && window.puter.ai) {
                console.log('🚀 Using Puter.js for caption generation...');
                const result = await window.puter.ai.chat(captionPrompt);

                // Handle different response formats from Puter.js
                if (typeof result === 'string') {
                    captionResponse = result;
                } else if (result?.message?.content) {
                    captionResponse = result.message.content;
                } else if (result?.content) {
                    captionResponse = result.content;
                } else if (result?.text) {
                    captionResponse = result.text;
                } else {
                    captionResponse = JSON.stringify(result);
                }
                console.log('✅ Puter.js caption generation successful!');
            } else {
                throw new Error('Puter.js not available');
            }
        } catch (puterError) {
            console.warn('Puter.js failed for captions, using Gemini:', puterError.message);
            const captionResult = await geminiModel.generateContent(captionPrompt);
            captionResponse = captionResult.response.text();
            console.log('✅ Gemini caption generation successful!');
        }

        // Parse captions from response
        const captions = parseCaptions(captionResponse);

        // Generate poster images
        // Strategy: Use Pollinations.ai for display, Canvas for persistent storage
        let posterImageUrl;
        let posterImageBackup; // Canvas base64 for reliable storage
        const styleDesc = styleDescriptions[style] || 'friendly';

        // Always generate Canvas backup first (instant, reliable, storable)
        console.log('🎨 Generating Canvas backup poster...');
        posterImageBackup = generateCanvasPoster(promotionData, styleDesc, captions.posterText);
        console.log('✅ Canvas backup ready:', posterImageBackup?.substring(0, 50) + '...');

        try {
            // Try Pollinations.ai for AI-generated images (FREE, no API key)
            console.log('🎨 Attempting Pollinations.ai image generation...');
            posterImageUrl = await generateImagenPoster(promotionData, styleDesc, captions.posterText);
            console.log('✅ Pollinations.ai poster generated!');
        } catch (imgError) {
            console.warn('⚠️ Pollinations.ai failed, using Canvas:', imgError.message);
            // Use Canvas as the main poster
            posterImageUrl = posterImageBackup;
            console.log('✅ Canvas poster used!');
        }

        return {
            posterImageUrl,           // Pollinations URL (or Canvas if failed)
            posterImageBackup,        // Canvas base64 (always available for resharing)
            captions: {
                whatsapp: captions.whatsapp,
                instagram: captions.instagram,
                facebook: captions.facebook
            },
            posterText: captions.posterText
        };
    } catch (error) {
        console.error('Generate poster error:', error);

        // Generate a basic poster even if captions fail
        const fallbackPosterUrl = generateCanvasPoster(promotionData, styleDescriptions[style] || 'friendly', `${product}\n${price}\n${offer}`);

        return {
            posterImageUrl: fallbackPosterUrl,
            posterImageBackup: fallbackPosterUrl, // Same as main since it's Canvas
            captions: {
                whatsapp: `${product} ${price ? `@ ${price}` : ''} ${offer ? `- ${offer}` : ''} 🎉`,
                instagram: `✨ ${product} ${price ? `@ ${price}` : ''}\n${offer || 'Visit us today!'}\n#LocalBusiness #ShopLocal`,
                facebook: `🛒 ${product} ${price ? `now available at ${price}` : ''}\n${offer || 'Come visit us!'}\nYour neighborhood store`
            },
            posterText: `${product}\n${price}\n${offer}`
        };
    }
}

/**
 * Parse captions from AI response
 */
function parseCaptions(response) {
    const sections = {
        posterText: '',
        whatsapp: '',
        instagram: '',
        facebook: ''
    };

    try {
        // Extract POSTER_TEXT section
        const posterMatch = response.match(/POSTER_TEXT:\s*([\s\S]*?)(?=WHATSAPP:|$)/i);
        if (posterMatch) {
            sections.posterText = posterMatch[1].trim();
        }

        // Extract WHATSAPP section
        const whatsappMatch = response.match(/WHATSAPP:\s*([\s\S]*?)(?=INSTAGRAM:|$)/i);
        if (whatsappMatch) {
            sections.whatsapp = whatsappMatch[1].trim();
        }

        // Extract INSTAGRAM section
        const instagramMatch = response.match(/INSTAGRAM:\s*([\s\S]*?)(?=FACEBOOK:|$)/i);
        if (instagramMatch) {
            sections.instagram = instagramMatch[1].trim();
        }

        // Extract FACEBOOK section
        const facebookMatch = response.match(/FACEBOOK:\s*([\s\S]*?)$/i);
        if (facebookMatch) {
            sections.facebook = facebookMatch[1].trim();
        }
    } catch (error) {
        console.error('Error parsing captions:', error);
    }

    return sections;
}

/**
 * Get dynamic product visual description based on business type
 */
function getProductVisualDescription(businessType, product) {
    const type = businessType.toLowerCase();
    const productLower = product.toLowerCase();

    if (type.includes('juice') || type.includes('drink') || productLower.includes('juice')) {
        return `- Center stage: A delicious, condensation-covered glass of thick ${product} with dynamic splash effect
- Surrounded by fresh, ripe fruits related to the drink and fresh green leaves
- Photorealistic liquid with droplets and refreshing appeal`;
    }

    if (type.includes('cafe') || type.includes('coffee')) {
        return `- Center stage: A premium steaming cup of ${product} with artistic latte art or swirling steam
- Coffee beans scattered artistically around, with warm bokeh lighting
- Rich brown tones with cream swirls and aromatic steam effects`;
    }

    if (type.includes('restaurant') || type.includes('food') || type.includes('biryani') || type.includes('thali')) {
        return `- Center stage: A beautifully plated ${product} with steam rising, looking hot and fresh
- Garnished with fresh herbs, spices, and traditional Indian serving style
- Warm lighting that makes the food look irresistible and appetizing`;
    }

    if (type.includes('bakery') || type.includes('cake') || type.includes('sweet')) {
        return `- Center stage: A delectable ${product} with perfect frosting/glaze and decorative toppings
- Soft, dreamy lighting with flour dust or sugar sparkles in the air
- Surrounded by baking ingredients and fresh confectionery`;
    }

    if (type.includes('salon') || type.includes('beauty') || type.includes('spa')) {
        return `- Center stage: Elegant beauty products and tools arranged artistically
- Soft, luxurious lighting with rose petals or flower elements
- Premium, spa-like ambiance with subtle shimmer effects`;
    }

    if (type.includes('kirana') || type.includes('grocery') || type.includes('store')) {
        return `- Center stage: ${product} displayed prominently with fresh, quality appearance
- Surrounded by colorful grocery items and fresh produce
- Bright, clean supermarket-style presentation`;
    }

    if (type.includes('cloth') || type.includes('fashion') || type.includes('garment')) {
        return `- Center stage: Stylish ${product} displayed on elegant mannequin or artful arrangement
- Premium fabric texture visible with professional fashion photography style
- Soft studio lighting with fashionable backdrop`;
    }

    if (type.includes('electronics') || type.includes('mobile') || type.includes('gadget')) {
        return `- Center stage: Sleek ${product} with modern tech aesthetic and subtle glow effects
- Minimalist dark background with neon accent lighting
- Premium unboxing style presentation with reflective surfaces`;
    }

    // Default for any business
    return `- Center stage: ${product} displayed prominently with premium commercial photography style
- Dynamic lighting and professional product presentation
- Eye-catching arrangement that highlights the product's best features`;
}

/**
 * Generate poster image using Pollinations.ai (FREE, no API key needed)
 * Uses the enhanced prompt from the confirmation step for better results
 * Converts the generated image to base64 data URL for persistent storage
 */
async function generateImagenPoster(promotionData, styleDescription, posterText) {
    const { product, price, offer, businessType, enhancedPrompt } = promotionData;

    // Use enhanced prompt content if available, otherwise fallback to basic
    const headline = enhancedPrompt?.headline || `${product} SALE`;
    const tagline = enhancedPrompt?.tagline || 'Best quality at best prices';

    // Create a concise image prompt for Pollinations.ai
    const imagePrompt = `Professional vibrant advertisement poster for ${product}, ${businessType} style, colorful sunburst rays background, bold text ${headline}, ${price || ''}, ${styleDescription}, Indian retail ad, modern graphic design, social media marketing poster`;

    try {
        // Encode the prompt for URL - remove problematic characters
        const cleanPrompt = imagePrompt
            .replace(/[""]/g, '')
            .replace(/[₹]/g, 'Rs')
            .replace(/[—–]/g, '-')
            .replace(/\n/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();

        const encodedPrompt = encodeURIComponent(cleanPrompt);

        // Use image.pollinations.ai endpoint
        const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=540&height=960&nologo=true`;

        console.log('🎨 Using Pollinations.ai for image generation...');

        // Return the URL directly - it will be displayed in an <img> tag
        // Note: This URL works for display but can't be converted to base64 due to CORS
        // If the image needs to be stored, the sharing/saving logic should handle it
        return imageUrl;

    } catch (error) {
        console.error('Pollinations.ai error:', error);
        throw error; // Let the caller handle fallback
    }
}

/**
 * Convert a Blob to base64 data URL
 */
function blobToBase64(blob) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
}

/**
 * Convert an image URL to base64 data URL using canvas
 * This is used to persist Pollinations.ai images
 */
async function convertImageUrlToBase64(imageUrl) {
    return new Promise((resolve) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';

        // Timeout after 30 seconds
        const timeout = setTimeout(() => {
            console.warn('Image conversion timed out');
            resolve(null);
        }, 30000);

        img.onload = () => {
            clearTimeout(timeout);
            try {
                const canvas = document.createElement('canvas');
                canvas.width = img.naturalWidth;
                canvas.height = img.naturalHeight;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0);
                const dataUrl = canvas.toDataURL('image/png');
                resolve(dataUrl);
            } catch (err) {
                console.warn('Canvas conversion failed:', err);
                resolve(null);
            }
        };

        img.onerror = () => {
            clearTimeout(timeout);
            console.warn('Image load failed');
            resolve(null);
        };

        // Add cache buster to avoid CORS caching issues
        img.src = imageUrl + '&t=' + Date.now();
    });
}

/**
 * Get style colors based on selected style
 */
function getStyleColors(style) {
    const styles = {
        friendly: {
            primary: '#4CAF50',
            secondary: '#81C784',
            accent: '#2E7D32',
            background: ['#E8F5E9', '#C8E6C9'],
            text: '#1B5E20'
        },
        festive: {
            primary: '#FF5722',
            secondary: '#FF8A65',
            accent: '#E64A19',
            background: ['#FFF3E0', '#FFE0B2'],
            text: '#BF360C'
        },
        offerFocused: {
            primary: '#F44336',
            secondary: '#EF5350',
            accent: '#D32F2F',
            background: ['#FFEBEE', '#FFCDD2'],
            text: '#B71C1C'
        },
        localStyle: {
            primary: '#FF6B35',
            secondary: '#F7931E',
            accent: '#C54A1B',
            background: ['#FFF8E1', '#FFECB3'],
            text: '#5D4037'
        }
    };
    return styles[style] || styles.friendly;
}

/**
 * Generate poster image using Canvas API (fallback)
 * Uses enhanced prompt for better text content
 */
function generateCanvasPoster(promotionData, styleDescription, posterText) {
    const { product, price, offer, businessType, style, enhancedPrompt } = promotionData;
    const colors = getStyleColors(style);

    // Use enhanced prompt content if available
    const headline = enhancedPrompt?.headline || product;
    const tagline = enhancedPrompt?.tagline || '';
    const offerText = enhancedPrompt?.offerHighlight || offer || '';
    const callToAction = enhancedPrompt?.callToAction || 'Visit us today!';

    // Create canvas
    const canvas = document.createElement('canvas');
    canvas.width = 540;
    canvas.height = 960;
    const ctx = canvas.getContext('2d');

    // Background gradient
    const bgGradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    bgGradient.addColorStop(0, colors.background[0]);
    bgGradient.addColorStop(1, colors.background[1]);
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Decorative circles
    ctx.fillStyle = colors.primary + '20';
    ctx.beginPath();
    ctx.arc(-50, 100, 200, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(canvas.width + 50, canvas.height - 150, 250, 0, Math.PI * 2);
    ctx.fill();

    // Main card
    const cardX = 30;
    const cardY = 80;
    const cardWidth = canvas.width - 60;
    const cardHeight = canvas.height - 160;
    const cardRadius = 24;

    // Draw rounded rectangle manually for browser compatibility
    ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
    ctx.beginPath();
    ctx.moveTo(cardX + cardRadius, cardY);
    ctx.lineTo(cardX + cardWidth - cardRadius, cardY);
    ctx.quadraticCurveTo(cardX + cardWidth, cardY, cardX + cardWidth, cardY + cardRadius);
    ctx.lineTo(cardX + cardWidth, cardY + cardHeight - cardRadius);
    ctx.quadraticCurveTo(cardX + cardWidth, cardY + cardHeight, cardX + cardWidth - cardRadius, cardY + cardHeight);
    ctx.lineTo(cardX + cardRadius, cardY + cardHeight);
    ctx.quadraticCurveTo(cardX, cardY + cardHeight, cardX, cardY + cardHeight - cardRadius);
    ctx.lineTo(cardX, cardY + cardRadius);
    ctx.quadraticCurveTo(cardX, cardY, cardX + cardRadius, cardY);
    ctx.closePath();
    ctx.fill();

    // Card shadow effect
    ctx.shadowColor = 'rgba(0,0,0,0.1)';
    ctx.shadowBlur = 20;
    ctx.shadowOffsetY = 10;
    ctx.fill();
    ctx.shadowColor = 'transparent';

    // Business type badge
    const badgeWidth = Math.min(businessType.length * 14 + 40, 280);
    const badgeX = (canvas.width - badgeWidth) / 2;

    // Badge background
    ctx.fillStyle = colors.primary;
    ctx.beginPath();
    ctx.moveTo(badgeX + 16, 110);
    ctx.lineTo(badgeX + badgeWidth - 16, 110);
    ctx.quadraticCurveTo(badgeX + badgeWidth, 110, badgeX + badgeWidth, 126);
    ctx.lineTo(badgeX + badgeWidth, 150);
    ctx.quadraticCurveTo(badgeX + badgeWidth, 166, badgeX + badgeWidth - 16, 166);
    ctx.lineTo(badgeX + 16, 166);
    ctx.quadraticCurveTo(badgeX, 166, badgeX, 150);
    ctx.lineTo(badgeX, 126);
    ctx.quadraticCurveTo(badgeX, 110, badgeX + 16, 110);
    ctx.closePath();
    ctx.fill();

    // Badge text
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 20px Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(businessType.toUpperCase(), canvas.width / 2, 145);

    // Emoji icon based on business type
    const emoji = getBusinessEmoji(businessType);
    ctx.font = '80px Arial';
    ctx.fillText(emoji, canvas.width / 2, 280);

    // HEADLINE - Use enhanced prompt headline
    ctx.fillStyle = colors.text;
    ctx.font = 'bold 38px Arial, sans-serif';
    const headlineLines = wrapText(ctx, headline, canvas.width - 100);
    let yPos = 360;
    headlineLines.forEach((line, i) => {
        ctx.fillText(line, canvas.width / 2, yPos + (i * 45));
    });
    yPos += headlineLines.length * 45 + 20;

    // TAGLINE - Show if available
    if (tagline) {
        ctx.fillStyle = colors.accent;
        ctx.font = 'italic 22px Arial, sans-serif';
        const taglineLines = wrapText(ctx, tagline, canvas.width - 80);
        taglineLines.forEach((line, i) => {
            ctx.fillText(line, canvas.width / 2, yPos + (i * 28));
        });
        yPos += taglineLines.length * 28 + 25;
    }

    // Price - prominent display
    if (price) {
        const priceText = price.includes('₹') ? price : `₹${price}`;
        const priceWidth = Math.max(priceText.length * 35 + 60, 200);

        ctx.fillStyle = colors.primary;
        ctx.beginPath();
        const priceX = (canvas.width - priceWidth) / 2;
        ctx.moveTo(priceX + 20, yPos);
        ctx.lineTo(priceX + priceWidth - 20, yPos);
        ctx.quadraticCurveTo(priceX + priceWidth, yPos, priceX + priceWidth, yPos + 20);
        ctx.lineTo(priceX + priceWidth, yPos + 70);
        ctx.quadraticCurveTo(priceX + priceWidth, yPos + 90, priceX + priceWidth - 20, yPos + 90);
        ctx.lineTo(priceX + 20, yPos + 90);
        ctx.quadraticCurveTo(priceX, yPos + 90, priceX, yPos + 70);
        ctx.lineTo(priceX, yPos + 20);
        ctx.quadraticCurveTo(priceX, yPos, priceX + 20, yPos);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 48px Arial, sans-serif';
        ctx.fillText(priceText, canvas.width / 2, yPos + 62);
        yPos += 130;
    }

    // Offer banner - use enhanced offer text
    const displayOffer = offerText || offer;
    if (displayOffer && displayOffer.trim()) {
        ctx.fillStyle = colors.accent;
        ctx.beginPath();
        ctx.moveTo(50, yPos);
        ctx.lineTo(canvas.width - 50, yPos);
        ctx.lineTo(canvas.width - 30, yPos + 35);
        ctx.lineTo(canvas.width - 50, yPos + 70);
        ctx.lineTo(50, yPos + 70);
        ctx.lineTo(70, yPos + 35);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 22px Arial, sans-serif';
        const shortOffer = displayOffer.length > 35 ? displayOffer.substring(0, 32) + '...' : displayOffer;
        ctx.fillText(shortOffer, canvas.width / 2, yPos + 47);
        yPos += 100;
    }

    // Decorative stars/sparkles
    ctx.fillStyle = colors.secondary;
    ctx.font = '24px Arial';
    ctx.fillText('✨', 80, 700);
    ctx.fillText('✨', canvas.width - 80, 650);
    ctx.fillText('⭐', 120, 750);

    // Call to action - use enhanced CTA
    ctx.fillStyle = colors.primary;
    ctx.font = 'bold 26px Arial, sans-serif';
    ctx.fillText(callToAction, canvas.width / 2, canvas.height - 200);

    // Footer branding
    ctx.fillStyle = '#999999';
    ctx.font = '16px Arial, sans-serif';
    ctx.fillText('Created with VyaparAI 🛒', canvas.width / 2, canvas.height - 100);

    // Decorative bottom line
    const lineGradient = ctx.createLinearGradient(100, 0, canvas.width - 100, 0);
    lineGradient.addColorStop(0, 'transparent');
    lineGradient.addColorStop(0.5, colors.primary);
    lineGradient.addColorStop(1, 'transparent');
    ctx.strokeStyle = lineGradient;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(100, canvas.height - 130);
    ctx.lineTo(canvas.width - 100, canvas.height - 130);
    ctx.stroke();

    return canvas.toDataURL('image/png');
}

/**
 * Get emoji based on business type
 */
function getBusinessEmoji(businessType) {
    const type = businessType.toLowerCase();

    if (type.includes('juice') || type.includes('drink')) return '🧃';
    if (type.includes('cafe') || type.includes('coffee')) return '☕';
    if (type.includes('restaurant') || type.includes('food')) return '🍽️';
    if (type.includes('bakery') || type.includes('cake')) return '🍰';
    if (type.includes('salon') || type.includes('beauty')) return '💇';
    if (type.includes('kirana') || type.includes('grocery')) return '🛒';
    if (type.includes('cloth') || type.includes('fashion')) return '👕';
    if (type.includes('electronics')) return '📱';
    if (type.includes('pharmacy') || type.includes('medical')) return '💊';
    if (type.includes('sweet') || type.includes('mithai')) return '🍬';
    if (type.includes('flower')) return '💐';
    if (type.includes('street') || type.includes('vendor')) return '🍿';

    return '🏪'; // Default shop
}

/**
 * Wrap text to fit within maxWidth
 */
function wrapText(ctx, text, maxWidth) {
    const words = text.split(' ');
    const lines = [];
    let currentLine = '';

    for (const word of words) {
        const testLine = currentLine ? `${currentLine} ${word}` : word;
        const metrics = ctx.measureText(testLine);

        if (metrics.width > maxWidth && currentLine) {
            lines.push(currentLine);
            currentLine = word;
        } else {
            currentLine = testLine;
        }
    }

    if (currentLine) {
        lines.push(currentLine);
    }

    // Limit to 2 lines max
    if (lines.length > 2) {
        lines[1] = lines[1] + '...';
        return lines.slice(0, 2);
    }

    return lines;
}

/**
 * Regenerate poster with same data
 */
export async function regeneratePoster(promotionData) {
    return generatePosterAndCaptions(promotionData);
}

export default {
    parseUserInput,
    generatePosterAndCaptions,
    regeneratePoster
};
