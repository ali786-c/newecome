<?php
/**
 * Phase 2: Brevo Email Infrastructure
 * -----------------------------------
 * This service handles transactional email sending via the Brevo API.
 */

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class BrevoService
{
    protected string $apiKey;
    protected string $baseUrl = 'https://api.brevo.com/v3/smtp/email';

    public function __construct()
    {
        $this->apiKey = config('services.brevo.key') ?? '';
    }

    /**
     * Send a transactional email.
     * 
     * @param string $toEmail Recipient email address.
     * @param string $toName Recipient name.
     * @param string $subject Email subject.
     * @param string $content HTML content of the email.
     * @param array $headers Optional custom headers.
     * @return bool
     */
    public function send(string $toEmail, string $toName, string $subject, string $content, array $headers = []): bool
    {
        if (empty($this->apiKey)) {
            Log::error('Brevo API key is not configured.');
            return false;
        }

        try {
            $fromEmail = config('mail.from.address', 'noreply@upgradercx.com');
            $fromName = config('mail.from.name', 'UpgraderCX');

            $payload = [
                'sender' => ['name' => $fromName, 'email' => $fromEmail],
                'to' => [['email' => $toEmail, 'name' => $toName]],
                'subject' => $subject,
                'htmlContent' => $content,
            ];

            if (!empty($headers)) {
                $payload['headers'] = $headers;
            }

            $response = Http::withHeaders([
                'api-key' => $this->apiKey,
                'Content-Type' => 'application/json',
                'Accept' => 'application/json',
            ])->withoutVerifying()->post($this->baseUrl, $payload);

            if ($response->successful()) {
                Log::info("Brevo email sent successfully to $toEmail: " . $response->json('messageId'));
                return true;
            }

            Log::error("Brevo API failed for $toEmail: " . $response->body());
            return false;

        } catch (\Exception $e) {
            Log::error("Brevo Service Exception: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Send email using a Brevo Template ID.
     * 
     * @param string $toEmail
     * @param string $toName
     * @param int $templateId
     * @param array $params Template variables.
     * @return bool
     */
    public function sendTemplate(string $toEmail, string $toName, int $templateId, array $params = []): bool
    {
        if (empty($this->apiKey)) return false;

        try {
            $payload = [
                'to' => [['email' => $toEmail, 'name' => $toName]],
                'templateId' => $templateId,
                'params' => $params,
            ];

            $response = Http::withHeaders([
                'api-key' => $this->apiKey,
                'Content-Type' => 'application/json',
            ])->withoutVerifying()->post($this->baseUrl, $payload);

            return $response->successful();
        } catch (\Exception $e) {
            Log::error("Brevo Template Service Exception: " . $e->getMessage());
            return false;
        }
    }
}
