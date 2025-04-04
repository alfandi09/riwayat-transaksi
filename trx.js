function calculateStringSimilarity(str1, str2) {
  if (!str1 || !str2) return 0;
  if (str1 === str2) return 1.0;
  if (str1.length < 2 || str2.length < 2) return 0.0;
  
  // Create bigrams
  let bigrams1 = new Set();
  let bigrams2 = new Set();
  
  for (let i = 0; i < str1.length - 1; i++) {
    bigrams1.add(str1.substring(i, i + 2));
  }
  
  for (let i = 0; i < str2.length - 1; i++) {
    bigrams2.add(str2.substring(i, i + 2));
  }
  
  // Calculate intersection
  let intersection = 0;
  for (const bigram of bigrams1) {
    if (bigrams2.has(bigram)) {
      intersection++;
    }
  }
  
  // Return Dice coefficient
  return (2.0 * intersection) / (bigrams1.size + bigrams2.size);
}

function calculateNGramSimilarity(ngrams1, ngrams2) {
  if (!ngrams1 || !ngrams2 || ngrams1.length === 0 || ngrams2.length === 0) {
    return 0;
  }
  
  const set1 = new Set(ngrams1);
  const set2 = new Set(ngrams2);
  
  let intersection = 0;
  for (const ngram of set1) {
    if (set2.has(ngram)) {
      intersection++;
    }
  }
  
  return (2.0 * intersection) / (set1.size + set2.size);
}

function generateNGrams(str, n) {
  if (!str || str.length < n) {
    return [];
  }
  
  const ngrams = [];
  for (let i = 0; i <= str.length - n; i++) {
    ngrams.push(str.substring(i, i + n));
  }
  
  return ngrams;
}

function calculateMatchScore(productInfo, dbProductInfo) {
  let totalScore = 0;
  
  // 1. Exact match (perbandingan string yang dinormalisasi)
  if (productInfo.normalized === dbProductInfo.normalized) {
    return 1.0; // Langsung return 1.0 untuk kecocokan sempurna
  }
  
  // 2. Token match (berbasis kata/token)
  const tokenMatchCount = productInfo.tokens.filter(token => 
    dbProductInfo.tokens.includes(token)
  ).length;
  
  const tokenMatchScore = Math.min(
    tokenMatchCount / Math.max(productInfo.tokens.length, 1),
    tokenMatchCount / Math.max(dbProductInfo.tokens.length, 1)
  );
  
  // Tambahkan skor hanya jika minimal token yang cocok terpenuhi
  if (tokenMatchCount >= SEARCH_CONFIG.MIN_TOKEN_MATCH || 
     (productInfo.tokens.length <= 1 && tokenMatchCount > 0)) {
    totalScore += tokenMatchScore * SEARCH_CONFIG.WEIGHTS.TOKEN_MATCH;
  }
  
  // 3. Numeric match (berbasis angka dalam nama produk)
  const numericMatchCount = productInfo.numbers.filter(num => 
    dbProductInfo.numbers.includes(num)
  ).length;
  
  if (productInfo.numbers.length > 0 && dbProductInfo.numbers.length > 0) {
    const numericMatchScore = numericMatchCount / 
      Math.max(productInfo.numbers.length, dbProductInfo.numbers.length);
    totalScore += numericMatchScore * SEARCH_CONFIG.WEIGHTS.NUMERIC_MATCH;
  }
  
  // 4. Text-only match (membandingkan teks tanpa angka/simbol)
  const textSimilarity = calculateStringSimilarity(
    productInfo.textOnly, 
    dbProductInfo.textOnly
  );
  totalScore += textSimilarity * 0.3; // Bobot lebih rendah untuk text-only
  
  // 5. Pattern match (untuk pola alfanumerik)
  const patternMatchScore = calculatePatternMatchScore(
    productInfo.alphanumericPatterns,
    dbProductInfo.alphanumericPatterns
  );
  totalScore += patternMatchScore * 0.4;
  
  // 6. N-gram similarity (untuk fuzzy matching)
  const bigramSimilarity = calculateNGramSimilarity(
    productInfo.bigrams,
    dbProductInfo.bigrams
  );
  
  const trigramSimilarity = calculateNGramSimilarity(
    productInfo.trigrams,
    dbProductInfo.trigrams
  );
  
  // Kombinasikan skor bigram dan trigram
  const ngramSimilarity = (bigramSimilarity + trigramSimilarity) / 2;
  totalScore += ngramSimilarity * SEARCH_CONFIG.WEIGHTS.FUZZY_MATCH;
  
  // Normalisasi skor total (maksimal 1.0)
  const weights = Object.values(SEARCH_CONFIG.WEIGHTS);
  const maxScore = weights.reduce((sum, weight) => sum + weight, 0);
  
  return Math.min(totalScore / maxScore, 1.0);
}

function calculatePatternMatchScore(patterns1, patterns2) {
  if (patterns1.length === 0 || patterns2.length === 0) {
    return 0;
  }
  
  let matchCount = 0;
  
  // Bandingkan setiap pola dari produk pertama dengan pola dari produk kedua
  for (const pattern1 of patterns1) {
    for (const pattern2 of patterns2) {
      // Text part matches exactly and number part is similar
      if (pattern1.text === pattern2.text) {
        // If numbers are exactly the same
        if (pattern1.number === pattern2.number) {
          matchCount += 1;
        } 
        // If numbers are close (for packages with similar sizes)
        else if (Math.abs(parseFloat(pattern1.number) - parseFloat(pattern2.number)) <= 0.5) {
          matchCount += 0.8;
        }
      }
    }
  }
  
  return matchCount / Math.max(patterns1.length, patterns2.length);
}
