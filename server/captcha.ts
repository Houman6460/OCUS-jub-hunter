import crypto from 'crypto';

interface CaptchaChallenge {
  question: string;
  answer: string;
  expires: number;
}

class CaptchaService {
  private challenges = new Map<string, CaptchaChallenge>();
  private readonly EXPIRY_TIME = 5 * 60 * 1000; // 5 minutes

  generateChallenge(): { id: string; question: string } {
    const operations = ['+', '-', '*'];
    const operation = operations[Math.floor(Math.random() * operations.length)];
    
    let num1: number, num2: number, answer: number;
    
    switch (operation) {
      case '+':
        num1 = Math.floor(Math.random() * 50) + 1;
        num2 = Math.floor(Math.random() * 50) + 1;
        answer = num1 + num2;
        break;
      case '-':
        num1 = Math.floor(Math.random() * 50) + 25;
        num2 = Math.floor(Math.random() * 25) + 1;
        answer = num1 - num2;
        break;
      case '*':
        num1 = Math.floor(Math.random() * 12) + 1;
        num2 = Math.floor(Math.random() * 12) + 1;
        answer = num1 * num2;
        break;
      default:
        num1 = 5;
        num2 = 5;
        answer = 10;
    }
    
    const id = crypto.randomBytes(16).toString('hex');
    const question = `${num1} ${operation} ${num2} = ?`;
    
    this.challenges.set(id, {
      question,
      answer: answer.toString(),
      expires: Date.now() + this.EXPIRY_TIME
    });
    
    // Cleanup expired challenges
    this.cleanupExpired();
    
    return { id, question };
  }
  
  validateChallenge(id: string, userAnswer: string): boolean {
    const challenge = this.challenges.get(id);
    
    if (!challenge) {
      return false;
    }
    
    if (Date.now() > challenge.expires) {
      this.challenges.delete(id);
      return false;
    }
    
    const isValid = challenge.answer === userAnswer.trim();
    this.challenges.delete(id); // Remove after validation
    
    return isValid;
  }
  
  async verifyRecaptcha(token: string, secretKey: string): Promise<boolean> {
    if (!token || !secretKey) {
      throw new Error('Missing reCAPTCHA token or secret key');
    }

    try {
      const response = await fetch('https://www.google.com/recaptcha/api/siteverify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `secret=${secretKey}&response=${token}`
      });

      const data = await response.json();
      
      if (data.success) {
        return true;
      } else {
        throw new Error('reCAPTCHA verification failed: ' + (data['error-codes'] || []).join(', '));
      }
    } catch (error) {
      throw new Error('reCAPTCHA verification error: ' + (error as Error).message);
    }
  }

  private cleanupExpired(): void {
    const now = Date.now();
    for (const [id, challenge] of this.challenges.entries()) {
      if (now > challenge.expires) {
        this.challenges.delete(id);
      }
    }
  }
}

export const captchaService = new CaptchaService();