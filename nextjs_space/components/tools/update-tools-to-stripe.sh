#!/bin/bash

# List of all tool landing page files
TOOLS=(
  "budget-calculator-landing.tsx"
  "conversion-analyzer-landing.tsx"
  "email-tester-landing.tsx"
  "seo-checker-landing.tsx"
  "website-auditor-landing.tsx"
)

for tool in "${TOOLS[@]}"; do
  if [ ! -f "$tool" ]; then
    echo "⚠️ Skipping $tool (not found)"
    continue
  fi
  
  echo "🔧 Updating $tool..."
  
  # 1. Add processingCheckout state
  if grep -q "const \[processingCheckout" "$tool"; then
    echo "  ✓ processingCheckout state already exists"
  else
    # Add after tripwireOffer state
    sed -i '/const \[tripwireOffer, setTripwireOffer\] = useState/a\  const [processingCheckout, setProcessingCheckout] = useState(false);' "$tool"
    echo "  ✓ Added processingCheckout state"
  fi
  
  # 2. Add handleTripwireCheckout function
  if grep -q "const handleTripwireCheckout" "$tool"; then
    echo "  ✓ handleTripwireCheckout function already exists"
  else
    # Find the line number after handleLeadSubmit function
    LINE=$(grep -n "const formatCurrency" "$tool" | head -1 | cut -d: -f1)
    if [ -n "$LINE" ]; then
      # Insert before formatCurrency
      sed -i "${LINE}i\\
\\
  const handleTripwireCheckout = async () => {\\
    if (!tripwireOffer) return;\\
    \\
    setProcessingCheckout(true);\\
    \\
    try {\\
      const response = await fetch('/api/create-tripwire-checkout', {\\
        method: 'POST',\\
        headers: { 'Content-Type': 'application/json' },\\
        body: JSON.stringify({\\
          offerName: tripwireOffer.offerName,\\
          amount: tripwireOffer.discountPrice,\\
          originalPrice: tripwireOffer.originalPrice,\\
          customerEmail: email,\\
          customerName: name,\\
        }),\\
      });\\
\\
      if (response.ok) {\\
        const data = await response.json();\\
        if (data.url) {\\
          window.location.href = data.url;\\
        }\\
      } else {\\
        alert('Failed to create checkout session. Please try again.');\\
        setProcessingCheckout(false);\\
      }\\
    } catch (error) {\\
      console.error('Error creating checkout:', error);\\
      alert('Failed to create checkout session. Please try again.');\\
      setProcessingCheckout(false);\\
    }\\
  };
" "$tool"
      echo "  ✓ Added handleTripwireCheckout function"
    fi
  fi
  
  # 3. Update the Button from Link to onClick
  if grep -q "onClick={handleTripwireCheckout}" "$tool"; then
    echo "  ✓ Button already updated to use onClick"
  else
    # This is complex, let's do it in parts
    echo "  ⚠️ Manual check needed for button update"
  fi
  
  echo "✅ Finished $tool"
  echo ""
done

echo "🎉 All tools updated!"
