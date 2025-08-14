        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4">
              Why Choose OCUS Photography Job Hunter?
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              This <strong>Google Chrome Extension</strong> is specifically designed for photographers working with Ubereats and Foodora through OCUS
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, i) => (
              <Card key={i} className="text-center p-8 hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 text-primary rounded-xl mb-6">
                    <feature.icon className="h-8 w-8" />
                  </div>
                  <h3 className="text-xl font-semibold text-slate-900 mb-4">{feature.title}</h3>
                  <p className="text-slate-600">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Installation Guide */}
      <section id="guide" className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4">
              Easy Installation & Setup
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Get started in less than 2 minutes with our simple installation process
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              {[
                {
                  step: "1",
                  title: "Download the Extension",
                  description: "After purchase, you'll receive a download link via email with the .crx extension file.",
                  note: "The file will be named: ocus-job-hunter-extension.crx"
                },
                {
                  step: "2", 
                  title: "Enable Developer Mode",
                  description: "Open Chrome, go to Extensions (chrome://extensions/), and toggle \"Developer mode\" in the top right.",
                  note: "This is required for installing extensions from file",
                  warning: true
                },
                {
                  step: "3",
                  title: "Install Extension", 
                  description: "Drag and drop the .crx file into your Chrome extensions page, or click \"Load unpacked\" and select the file."
                },
                {
                  step: "✓",
                  title: "Start Using",
                  description: "Navigate to OCUS.com, and the extension will automatically start finding jobs for you!",
                  note: "You'll see the extension icon in your browser toolbar",
                  success: true
                }
              ].map((item, i) => (
                <div key={i} className="flex items-start space-x-4">
                  <div className={`flex-shrink-0 w-10 h-10 ${item.success ? 'bg-accent' : 'bg-primary'} text-white rounded-full flex items-center justify-center font-bold`}>
                    {item.step}
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-slate-900 mb-2">{item.title}</h3>
                    <p className="text-slate-600 mb-3">{item.description}</p>
                    {item.note && (
                      <div className={`rounded-lg p-3 text-sm ${
                        item.warning ? 'bg-yellow-50 border border-yellow-200 text-yellow-800' :
                        item.success ? 'bg-accent/10 border border-accent/20 text-accent' :
                        'bg-slate-100 text-slate-700'
                      }`}>
                        {item.note}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="relative">
              {/* Chrome extensions page mockup */}
              <Card className="shadow-2xl overflow-hidden">
                <div className="bg-gray-100 px-4 py-3 border-b">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                    <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                    <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                    <span className="ml-4 text-sm text-gray-600">chrome://extensions/</span>
                  </div>
                </div>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">Extensions</h3>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600">Developer mode</span>
                      <div className="w-10 h-6 bg-primary rounded-full relative">
                        <div className="w-4 h-4 bg-white rounded-full absolute right-1 top-1"></div>
                      </div>
                    </div>
                  </div>
                  <Card className="p-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                        <Bot className="text-primary text-xl" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-slate-900">OCUS Job Hunter</h4>
                        <p className="text-sm text-gray-600">Automate your OCUS job search</p>
                      </div>
                      <div className="w-10 h-6 bg-accent rounded-full relative">
                        <div className="w-4 h-4 bg-white rounded-full absolute right-1 top-1"></div>
                      </div>
                    </div>
                  </Card>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Usage Instructions */}
          <Card className="mt-16 shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl text-center">How to Use the Extension</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-8">
                {[
                  { icon: Globe, title: "Visit OCUS", description: "Navigate to ocus.com in your Chrome browser" },
                  { icon: Play, title: "Auto-Activate", description: "The extension automatically starts scanning for jobs" },
                  { icon: List, title: "View Results", description: "Click the extension icon to see all found jobs" }
                ].map((step, i) => (
                  <div key={i} className="text-center">
                    <div className="w-16 h-16 bg-primary/10 text-primary rounded-xl mx-auto mb-4 flex items-center justify-center">
                      <step.icon className="h-8 w-8" />
                    </div>
                    <h4 className="font-semibold text-slate-900 mb-2">{step.title}</h4>
                    <p className="text-slate-600 text-sm">{step.description}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4">
              What Photographers Are Saying
            </h2>
            <p className="text-xl text-slate-600">
              Join photographers across Europe and US who've transformed their OCUS experience
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, i) => (
              <Card key={i} className="bg-slate-50 relative">
                <CardContent className="p-8">
                  <div className="flex items-center mb-6">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center text-white font-bold">
                      {testimonial.avatar}
                    </div>
                    <div className="ml-4">
                      <h4 className="font-semibold text-slate-900">{testimonial.name}</h4>
                      <p className="text-slate-600 text-sm">{testimonial.role}</p>
                      <p className="text-slate-500 text-xs mt-1">{testimonial.location}</p>
                    </div>
                  </div>
                  <div className="flex text-yellow-400 mb-4">
                    {[...Array(testimonial.rating)].map((_, j) => (
                      <Star key={j} className="h-4 w-4 fill-current" />
                    ))}
                  </div>
                  <p className="text-slate-600 italic">"{testimonial.text}"</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4">
              Get OCUS Photography Job Hunter Today
            </h2>
            <p className="text-xl text-slate-600">
              One-time purchase, lifetime access
            </p>
          </div>

          <div className="max-w-md mx-auto">
            <Card className="shadow-xl border-2 border-primary/20">
              <div className="bg-gradient-to-r from-primary to-secondary p-6 text-center text-white">
                <h3 className="text-2xl font-bold mb-2">OCUS Photography Job Hunter</h3>
                <div className="text-4xl font-bold mb-2">
                  $500
                  <span className="text-lg font-normal opacity-80 ml-2">one-time</span>
                </div>
                <p className="opacity-90">Lifetime access, no recurring fees</p>
              </div>
              
              <CardContent className="p-8">
                <ul className="space-y-4 mb-8">
                  {[
                    "Auto-find Ubereats & Foodora photography gigs",
                    "Auto-login when OCUS logs you out", 
                    "Location-based filtering for your area",
                    "Real-time alerts for new photography jobs",
                    "Google Chrome Extension - easy to use", 
                    "One-time payment - use forever",
                    "30-day money-back guarantee"
                  ].map((feature, i) => (
                    <li key={i} className="flex items-center">
                      <Check className="text-accent mr-3 h-4 w-4" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <Link href="/checkout">
                  <Button className="w-full bg-primary text-white py-4 text-lg font-bold hover:bg-secondary transform hover:scale-105 shadow-lg mb-6">
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    Buy Now - Instant Download
                  </Button>
                </Link>

                <div className="text-center text-sm text-slate-500 mb-6">
                  Secure payment powered by Stripe & PayPal
                </div>

                <Card className="bg-slate-50 text-center p-4">
                  <Shield className="text-accent text-xl mx-auto mb-2" />
                  <p className="text-sm text-slate-600">
                    <strong>100% Secure Purchase</strong><br />
                    SSL encrypted & PCI compliant
                  </p>
                </Card>
              </CardContent>
            </Card>
          </div>

          {/* Trust Indicators */}
          <div className="mt-16 grid md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-primary">2,847</div>
              <div className="text-slate-600">Happy Customers</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-accent">4.9/5</div>
              <div className="text-slate-600">Average Rating</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-secondary">99%</div>
              <div className="text-slate-600">Success Rate</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary">24/7</div>
              <div className="text-slate-600">Support</div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-xl text-slate-600">
              Everything you need to know about the OCUS Job Hunter extension
            </p>
          </div>

          <div className="space-y-6">
            {faqs.map((faq, i) => (
              <Card key={i} className="border border-slate-200 overflow-hidden">
                <button 
                  onClick={() => toggleFAQ(i)}
                  className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-slate-50 transition-colors"
                >
                  <h3 className="font-semibold text-slate-900">{faq.question}</h3>
                  <ChevronDown className={`text-slate-400 transition-transform ${faqOpen[i] ? 'rotate-180' : ''}`} />
                </button>
                {faqOpen[i] && (
                  <div className="px-6 pb-4 text-slate-600">
                    {faq.answer}
                  </div>
                )}
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-12 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <Bot className="text-2xl text-primary mr-3" />
                <span className="text-xl font-bold">OCUS Photography Job Hunter</span>
              </div>
              <p className="text-slate-400 mb-4">
                Automate your OCUS photography job search for Ubereats & Foodora with auto-login feature.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-slate-400">
                <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#pricing" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#guide" className="hover:text-white transition-colors">Installation Guide</a></li>
                <li><a href="#faq" className="hover:text-white transition-colors">FAQ</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-slate-400">
                <li>
                  <a href="mailto:support@ocusjobhunter.com" className="hover:text-white transition-colors flex items-center">
                    <Mail className="h-4 w-4 mr-2" />
                    Email Support
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors flex items-center">
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Help Center
                  </a>
                </li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-slate-400">
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Refund Policy</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-slate-800 mt-8 pt-8 text-center text-slate-400">
            <p>&copy; 2024 OCUS Job Hunter. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
