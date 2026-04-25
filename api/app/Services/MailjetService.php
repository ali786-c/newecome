<?php
/**
 * Mailjet Email Infrastructure (v3.1 - Curl Implementation)
 * --------------------------------------------------------
 * This service handles transactional email sending via direct curl to match user's working script.
 */

namespace App\Services;

use Illuminate\Support\Facades\Log;

class MailjetService
{
    protected string $apiKey;
    protected string $apiSecret;
    protected string $baseUrl = 'https://api.mailjet.com/v3.1/send';

    public function __construct()
    {
        $this->apiKey = config('services.mailjet.key') ?? '';
        $this->apiSecret = config('services.mailjet.secret') ?? '';
    }

    /**
     * Send a transactional email using direct curl (v3.1).
     * 
     * @param string $toEmail Recipient email address.
     * @param string $toName Recipient name.
     * @param string $subject Email subject.
     * @param string $content HTML content of the email.
     * @return mixed
     */
    public function send(string $toEmail, string $toName, string $subject, string $content)
    {
        if (empty($this->apiKey) || empty($this->apiSecret)) {
            Log::error('Mailjet API credentials are not configured.');
            return false;
        }

        try {
            $fromEmail = config('mail.from.address', 'no-reply@upgradercx.com');
            $fromName = config('mail.from.name', 'UpgraderCX');

            $body = [
                'Messages' => [
                    [
                        'From' => [
                            'Email' => $fromEmail,
                            'Name' => $fromName
                        ],
                        'To' => [
                            [
                                'Email' => $toEmail,
                                'Name' => $toName
                            ]
                        ],
                        'Subject' => $subject,
                        'HTMLPart' => $content,
                    ]
                ]
            ];

            $ch = curl_init($this->baseUrl);
            curl_setopt($ch, CURLOPT_USERPWD, "{$this->apiKey}:{$this->apiSecret}");
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($ch, CURLOPT_POST, true);
            curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($body));
            curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
            
            // Optional: for local development if SSL issues occur
            curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);

            $response = curl_exec($ch);
            $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
            curl_close($ch);

            $responseArray = json_decode($response, true);

            if ($httpCode >= 200 && $httpCode < 300) {
                Log::info("Mailjet Curl email sent successfully to $toEmail");
                return $responseArray;
            }

            Log::error("Mailjet API Curl failed for $toEmail (Code $httpCode): " . $response);
            return $responseArray;

        } catch (\Exception $e) {
            Log::error("Mailjet Curl Service Exception: " . $e->getMessage());
            return false;
        }
    }
}
