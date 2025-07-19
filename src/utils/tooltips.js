// Tooltip content configuration for dashboard elements
// Organized by dashboard sections for easy maintenance

export const tooltips = {
  // ===== OVERVIEW TAB TOOLTIPS =====
  overview: {
    kpis: {
      totalSpend: {
        title: "Total Ad Spend",
        content: "Total amount spent on Facebook and Instagram advertising campaigns during the selected period.",
        example: "If you spent Rp 10,000,000 on FB ads in the last 7 days"
      },
      totalRevenue: {
        title: "Sales Order Revenue", 
        content: "Actual revenue from sales orders attributed to Facebook/Instagram advertising based on customer source tracking.",
        example: "Revenue from customers who came through fb_ads or ig_ads"
      },
      totalLeads: {
        title: "Total Leads",
        content: "Number of messaging conversations started from Facebook ads. These are potential customers who contacted you directly through ads.",
        example: "WhatsApp messages, Messenger conversations, or direct calls"
      },
      totalPurchases: {
        title: "Total Purchases",
        content: "Number of actual purchases/orders from customers who came through Facebook advertising, tracked in your sales system.",
        example: "Completed transactions from FB/IG ad customers"
      }
    },
    performance: {
      fbReportedRoas: {
        title: "Facebook Reported ROAS",
        content: "Return on Ad Spend as calculated by Facebook platform using their conversion tracking. Formula: FB Revenue ÷ Ad Spend",
        example: "FB reports 3.5x ROAS = Rp 3,500 revenue per Rp 1,000 spent"
      },
      trueRoas: {
        title: "True ROAS", 
        content: "Actual Return on Ad Spend based on real sales orders from your system. More accurate for business decisions. Formula: Actual Revenue ÷ Ad Spend",
        example: "True ROAS 4.2x = Rp 4,200 actual revenue per Rp 1,000 spent"
      },
      impressions: {
        title: "Impressions",
        content: "Total number of times your ads were displayed to users on Facebook and Instagram platforms.",
        example: "1,000,000 impressions = your ads were shown 1M times"
      },
      leadToPurchase: {
        title: "Lead → Purchase Conversion",
        content: "Percentage of leads (messaging conversations) that converted into actual purchases. Shows effectiveness of your sales process.",
        example: "20% conversion = 20 out of 100 leads became customers"
      }
    }
  },

  // ===== CAMPAIGN TAB TOOLTIPS =====
  campaign: {
    metrics: {
      roas: {
        title: "ROAS (Return on Ad Spend)",
        content: "How much revenue generated for every rupiah spent on ads. Higher is better. Formula: Revenue ÷ Ad Spend",
        example: "3x ROAS = Rp 3,000 revenue per Rp 1,000 ad spend. Good ROAS is 3x+"
      },
      costPerLead: {
        title: "Cost per Lead",
        content: "Average cost to generate one messaging conversation/lead. Lower is better. Formula: Total Spend ÷ Total Conversations",
        example: "Rp 50,000 cost per lead = you spend Rp 50k to get 1 potential customer"
      },
      costPerPurchase: {
        title: "Cost per Purchase",
        content: "Average cost to generate one purchase/order. Key metric for profitability. Formula: Total Spend ÷ Total Purchases",
        example: "Rp 200,000 cost per purchase = you spend Rp 200k to get 1 customer"
      }
    },
    trends: {
      cpm: {
        title: "CPM (Cost per Mille)",
        content: "Cost to show your ad to 1,000 people. Lower CPM means more cost-effective reach. Industry varies by competition.",
        example: "Rp 25,000 CPM = costs Rp 25k to reach 1,000 people. Good CPM: Rp 15k-50k"
      },
      ctr: {
        title: "CTR (Click-through Rate)",
        content: "Percentage of people who clicked your ad after seeing it. Higher CTR means more engaging ads and better targeting.",
        example: "2% CTR = 20 clicks per 1,000 impressions. Good CTR: 1-3%"
      },
      frequency: {
        title: "Frequency",
        content: "Average number of times the same person sees your ad. Frequency 1-3 is optimal. Above 3 may cause ad fatigue.",
        example: "2.5 frequency = each person sees your ad 2.5 times on average"
      }
    }
  },

  // ===== ATTRIBUTION TAB TOOLTIPS =====
  attribution: {
    cards: {
      fbAttributedRevenue: {
        title: "FB Attributed Revenue",
        content: "Total revenue from sales orders where customers came from Facebook/Instagram ads, tracked through customer_sumber_info field in your system.",
        example: "Orders with customer_sumber_info = 'fb_ads' or 'ig_ads'"
      },
      trueRoas: {
        title: "True ROAS",
        content: "Real Return on Ad Spend using actual sales data from your system, not Facebook's tracking. More accurate for business decisions and budget allocation.",
        example: "Based on actual completed transactions in your sales system"
      },
      fbOrderRate: {
        title: "FB → Order Rate",
        content: "Percentage of Facebook-reported purchases that resulted in actual sales orders in your system. Measures attribution accuracy.",
        example: "80% rate = 8 out of 10 FB purchases became real orders"
      },
      avgOrderValue: {
        title: "Average Order Value", 
        content: "Average transaction value per order from customers who came through Facebook advertising. Higher AOV indicates more valuable customers.",
        example: "Rp 500,000 AOV = average customer spends Rp 500k per order"
      }
    },
    funnel: {
      fbImpressions: {
        title: "FB Ad Impressions",
        content: "Total number of times your Facebook ads were displayed to potential customers during the selected period.",
        example: "5M impressions = your ads were shown 5 million times"
      },
      fbPurchases: {
        title: "FB Purchases",
        content: "Number of purchases reported by Facebook platform based on their conversion tracking (pixel events).",
        example: "FB reports 100 purchases from their tracking system"
      },
      actualSales: {
        title: "Actual Sales",
        content: "Number of confirmed sales orders in your system from customers who came through Facebook advertising.",
        example: "85 actual orders completed and recorded in your sales system"
      },
      attributionRate: {
        title: "Attribution Rate",
        content: "Percentage of Facebook purchases that successfully converted to actual sales orders. Shows tracking accuracy and setup quality.",
        example: "85% attribution = 85 out of 100 FB purchases became real orders"
      }
    },
    insights: {
      attributionAccuracy: {
        title: "Attribution Accuracy",
        content: "Percentage of Facebook-reported purchases that can be matched to actual sales orders. Higher percentage means better tracking setup.",
        example: "90% accuracy = 9 out of 10 FB purchases can be tracked to real orders"
      },
      revenueGap: {
        title: "Revenue Gap",
        content: "Difference between actual attributed revenue and Facebook-reported revenue. Positive gap means FB under-reports, negative means over-reports.",
        example: "+Rp 2M gap = you earned Rp 2M more than FB reported"
      },
      attributionPercentage: {
        title: "Attribution Rate",
        content: "Percentage of total business revenue that comes from Facebook/Instagram advertising. Shows channel contribution to overall business.",
        example: "40% attribution = 40% of total revenue comes from FB ads"
      }
    }
  },

  // ===== BRANCH TAB TOOLTIPS =====
  branch: {
    metrics: {
      fbAdSpend: {
        title: "FB Ad Spend",
        content: "Portion of total Facebook ad spending allocated to this branch based on leads ratio and performance distribution.",
        example: "60% leads from this branch = 60% of ad spend allocated here"
      },
      realRevenue: {
        title: "Real Revenue (Sales Orders)",
        content: "Actual revenue from completed sales orders at this branch location, sourced directly from your transaction system.",
        example: "Revenue from all orders with branch_name = 'Pitcar Purwokerto'"
      },
      fbOrders: {
        title: "FB Orders",
        content: "Number of actual orders/purchases at this branch that originated from Facebook advertising campaigns.",
        example: "25 orders from customers who came through FB/IG ads"
      },
      avgOrderValue: {
        title: "Average Order Value",
        content: "Average transaction value per order at this branch from Facebook-attributed customers.",
        example: "Rp 750,000 AOV = customers from FB ads spend Rp 750k on average"
      }
    },
    performance: {
      outperforming: {
        title: "Outperforming",
        content: "This branch has higher ROAS than the overall average across all branches. Good candidate for budget increase.",
        example: "Branch ROAS 4.2x vs overall 3.1x = outperforming by 35%"
      },
      underperforming: {
        title: "Underperforming", 
        content: "This branch has lower ROAS than the overall average. May need budget reallocation, targeting optimization, or strategy review.",
        example: "Branch ROAS 2.1x vs overall 3.1x = underperforming by 32%"
      },
      profitMargin: {
        title: "Profit Margin",
        content: "Profit as percentage of revenue (Profit ÷ Revenue × 100). Shows how profitable Facebook advertising is for this specific branch.",
        example: "25% margin = Rp 250,000 profit per Rp 1,000,000 revenue"
      },
      costPerOrder: {
        title: "Cost per Order",
        content: "Average advertising cost to generate one order at this branch. Lower cost indicates more efficient customer acquisition.",
        example: "Rp 180,000 cost per order = you spend Rp 180k in ads to get 1 order"
      }
    },
    recommendations: {
      scaleTopPerformer: {
        title: "Scale Top Performer",
        content: "This branch shows excellent return on ad spend and profitability. Consider increasing marketing budget to maximize profitable opportunities.",
        example: "High ROAS branch should get more budget allocation"
      },
      reviewUnderperformer: {
        title: "Review Underperformer",
        content: "This branch has low profitability from Facebook ads. Consider reducing budget, improving targeting, or reviewing local market strategy.",
        example: "Low ROAS branch needs optimization or budget reduction"
      },
      highAcquisitionCost: {
        title: "High Acquisition Cost",
        content: "This branch has high cost per customer acquisition. Review audience targeting, ad creative quality, or market competitiveness.",
        example: "Cost per order above average indicates inefficient spending"
      },
      lowOrderVolume: {
        title: "Low Order Volume", 
        content: "This branch generated few orders from Facebook ads. Consider market penetration strategy, budget increase, or local marketing approach.",
        example: "Less than 5 orders indicates limited market penetration"
      }
    }
  },

  // ===== SHARED TOOLTIPS =====
  shared: {
    dataQuality: {
      fbAdsData: {
        title: "Facebook Ads Data",
        content: "Data comes from Facebook Ads Manager API, updated every 4 hours. Includes spend, impressions, clicks, and conversion metrics.",
        example: "Last updated: 2 hours ago from FB Ads Manager"
      },
      salesOrderData: {
        title: "Sales Order Data",
        content: "Data comes from your sales order system with real transaction information. Includes completed orders, revenue, and customer sources.",
        example: "Real-time data from your business transactions"
      },
      sampleData: {
        title: "Sample Data",
        content: "Using demonstration data for preview purposes. Connect your real data sources (Facebook Ads & Sales System) for accurate business insights.",
        example: "Switch to real data for actual business decisions"
      }
    },
    dateRange: {
      today: {
        title: "Today",
        content: "Performance data for the current day. Data may be incomplete as the day is still in progress.",
        example: "Partial data - day not yet complete"
      },
      yesterday: {
        title: "Yesterday", 
        content: "Complete performance data for the previous day. Most reliable for daily analysis and comparisons.",
        example: "Full 24-hour data available"
      },
      last7Days: {
        title: "Last 7 Days",
        content: "Performance data for the last 7 complete days, excluding today. Good for weekly trends and patterns analysis.",
        example: "7 complete days of performance data"
      },
      last30Days: {
        title: "Last 30 Days",
        content: "Performance data for the last 30 complete days. Ideal for monthly analysis and budget planning.",
        example: "30 days of complete performance history"
      },
      thisMonth: {
        title: "This Month",
        content: "Performance data from the first day of current month until today. Useful for monthly budget tracking.",
        example: "Month-to-date performance tracking"
      }
    },
    tableColumns: {
      spend: {
        title: "Spend",
        content: "Total amount spent on advertising for this group/product during the selected period.",
        example: "Rp 5,000,000 spent on this product's ads"
      },
      reach: {
        title: "Reach",
        content: "Number of unique people who saw your ads at least once. Different from impressions which count total views.",
        example: "10,000 reach = 10k unique people saw your ads"
      },
      impressions: {
        title: "Impressions", 
        content: "Total number of times your ads were displayed, including multiple views by the same person.",
        example: "50,000 impressions from 10,000 people (5x frequency)"
      },
      conversations: {
        title: "Leads Generated",
        content: "Number of messaging conversations started from this ad (WhatsApp, Messenger, calls). These are your potential customers.",
        example: "150 conversations = 150 people contacted you"
      },
      purchases: {
        title: "Purchases",
        content: "Number of purchases attributed to this ad by Facebook's tracking system.",
        example: "25 purchases tracked by Facebook pixel"
      },
      purchaseValue: {
        title: "Purchase Value",
        content: "Total revenue generated from purchases attributed to these ads by Facebook tracking.",
        example: "Rp 15,000,000 revenue from FB-tracked purchases"
      }
    }
  }
}

// Helper function to get tooltip by path
export const getTooltip = (path) => {
  const keys = path.split('.')
  let current = tooltips
  
  for (const key of keys) {
    current = current[key]
    if (!current) return null
  }
  
  return current
}

// Predefined tooltip configurations for common use cases
export const commonTooltips = {
  roas: getTooltip('campaign.metrics.roas'),
  cpm: getTooltip('campaign.trends.cpm'),
  ctr: getTooltip('campaign.trends.ctr'),
  frequency: getTooltip('campaign.trends.frequency'),
  costPerLead: getTooltip('campaign.metrics.costPerLead'),
  costPerPurchase: getTooltip('campaign.metrics.costPerPurchase'),
  trueRoas: getTooltip('attribution.cards.trueRoas'),
  fbAttributedRevenue: getTooltip('attribution.cards.fbAttributedRevenue'),
  attributionAccuracy: getTooltip('attribution.insights.attributionAccuracy')
} 