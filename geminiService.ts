import { GoogleGenAI, GenerateContentResponse, Type } from "@google/genai";
import type { SearchResult, GroundingChunk, SearchType } from '../types';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const phoneSearchSchema = {
    type: Type.OBJECT,
    properties: {
        ownerName: {
            type: Type.STRING,
            description: "The full name of the most likely current registered owner of the phone number. If no name can be found with high confidence, this should be null or empty.",
        },
        confidenceLevel: {
            type: Type.STRING,
            description: "The confidence level (e.g., 'High', 'Medium', 'Low') that the ownerName is correct, based on the quality of public evidence."
        },
        nameVerificationSummary: {
            type: Type.STRING,
            description: "A detailed explanation of the public evidence used to determine the owner's name. Must cite the sources (e.g., 'Name found on a public Facebook profile linked to this number', 'Listed in a public business directory')."
        },
        socialProfiles: {
            type: Type.ARRAY,
            description: "A list of social media profiles and messaging services associated with the phone number.",
            items: {
                type: Type.OBJECT,
                properties: {
                    platform: {
                        type: Type.STRING,
                        description: "The name of the social media platform (e.g., WhatsApp, Telegram, Facebook, Signal)."
                    },
                    nameOnPlatform: {
                        type: Type.STRING,
                        description: "The full name registered on this specific platform."
                    },
                    username: {
                        type: Type.STRING,
                        description: "The username associated with the profile, if available."
                    }
                },
                required: ["platform"]
            }
        },
        contactNetwork: {
            type: Type.ARRAY,
            description: "A list of individuals or entities the phone number owner is known to communicate with, based on public data.",
            items: {
                type: Type.OBJECT,
                properties: {
                    name: {
                        type: Type.STRING,
                        description: "The name of the contact."
                    },
                    relationship: {
                        type: Type.STRING,
                        description: "The nature of the relationship (e.g., Family, Colleague, Frequent Contact)."
                    },
                    source: {
                        type: Type.STRING,
                        description: "The public source where this connection was found (e.g., 'Tagged in Facebook photo', 'Listed as contact on company website')."
                    }
                },
                required: ["name"]
            }
        },
        presenceAnalysis: {
            type: Type.ARRAY,
            description: "An analysis of the phone number's likely presence on various online platforms, based on public data.",
            items: {
                type: Type.OBJECT,
                properties: {
                    platform: { type: Type.STRING, description: "The name of the platform (e.g., WhatsApp, Telegram)." },
                    isRegistered: { type: Type.BOOLEAN, description: "True if public evidence suggests the number is registered on this platform." },
                    lastSeen: { type: Type.STRING, description: "A precise estimation of the last known public activity associated with the number on this platform, including a date if possible (e.g., 'Active on 2024-07-15', 'Last public post was 3 months ago', 'Public activity date undetermined')." },
                    source: { type: Type.STRING, description: "The source of the evidence for this finding." }
                },
                required: ["platform", "isRegistered", "source"]
            }
        },
        activitySummary: {
            type: Type.STRING,
            description: "A concise summary of the overall online presence and recent activity level of the phone number, based on all findings."
        },
        summary: {
            type: Type.STRING,
            description: "A brief text summary of all findings. Must start by stating the confidence level and acknowledging the possibility of outdated data due to number recycling."
        }
    }
};


export const performSearch = async (query: string, searchType: SearchType): Promise<SearchResult> => {
    try {
        if (searchType === 'phone' || searchType === 'truecaller') {
            const response = await ai.models.generateContent({
                model: "gemini-2.5-flash",
                contents: query,
                config: {
                    responseMimeType: "application/json",
                    responseSchema: phoneSearchSchema,
                },
            });

            const jsonResponse = JSON.parse(response.text);
            
            return {
                text: jsonResponse.summary || "The search completed successfully.",
                sources: [], 
                phoneInfo: {
                    ownerName: jsonResponse.ownerName,
                    confidenceLevel: jsonResponse.confidenceLevel,
                    nameVerificationSummary: jsonResponse.nameVerificationSummary,
                    socialProfiles: jsonResponse.socialProfiles,
                    contactNetwork: jsonResponse.contactNetwork,
                    presenceAnalysis: jsonResponse.presenceAnalysis,
                    activitySummary: jsonResponse.activitySummary,
                }
            };
        } else {
            const response: GenerateContentResponse = await ai.models.generateContent({
                model: "gemini-2.5-flash",
                contents: query,
                config: {
                    tools: [{ googleSearch: {} }],
                },
            });
            
            const text = response.text;
            const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
            const sources: GroundingChunk[] = Array.isArray(groundingChunks) ? groundingChunks : [];

            return { text, sources };
        }

    } catch (error) {
        console.error("Error performing search with Gemini API:", error);
        if (error instanceof Error && (error.message.includes('429') || error.message.includes('RESOURCE_EXHAUSTED'))) {
            throw new Error("RATE_LIMIT_EXCEEDED");
        }
        throw new Error("The search service is currently unavailable or experiencing issues. Please try again later.");
    }
};
