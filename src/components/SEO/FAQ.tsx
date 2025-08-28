import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { StructuredData, generateFAQSchema } from "@/components/SEO/StructuredData";

interface FAQ {
  question: string;
  answer: string;
}

interface FAQSectionProps {
  title?: string;
  faqs: FAQ[];
  className?: string;
}

export function FAQSection({ title = "Frequently Asked Questions", faqs, className = "" }: FAQSectionProps) {
  const schema = generateFAQSchema(faqs);

  return (
    <>
      <StructuredData data={schema} id="faq" />
      <section className={`py-12 ${className}`}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-2xl lg:text-3xl font-bold">{title}</CardTitle>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                {faqs.map((faq, index) => (
                  <AccordionItem key={index} value={`item-${index}`}>
                    <AccordionTrigger className="text-left font-semibold">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground leading-relaxed">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        </div>
      </section>
    </>
  );
}

// Pre-defined FAQ sets for different pages
export const recruitmentFAQs: FAQ[] = [
  {
    question: "How does MyRecruita's recruitment process work?",
    answer: "Our process begins with understanding your career goals and requirements. We then match you with relevant opportunities, provide CV optimization, prepare you for interviews, and support you throughout the entire hiring process until you secure the right role."
  },
  {
    question: "What industries does MyRecruita specialize in?",
    answer: "We specialize in Finance & Accounting, Technology & IT, Legal, Healthcare, and Executive Search. Our team has deep sector expertise and maintains strong relationships with leading employers in these fields."
  },
  {
    question: "Is there a fee for candidates using MyRecruita's services?",
    answer: "No, our recruitment services are completely free for candidates. We are paid by employers when we successfully place candidates. Our career coaching and CV enhancement services are also provided at no cost."
  },
  {
    question: "How long does the recruitment process typically take?",
    answer: "The timeline varies depending on the role and your specific requirements. Generally, we aim to present suitable opportunities within 48-72 hours of initial consultation, with the full process typically taking 2-4 weeks from application to offer."
  },
  {
    question: "Do you work with candidates at all experience levels?",
    answer: "Yes, we work with professionals at all career stages - from recent graduates to senior executives. We tailor our approach based on your experience level and career objectives."
  }
];

export const employerFAQs: FAQ[] = [
  {
    question: "What makes MyRecruita different from other recruitment agencies?",
    answer: "We combine deep sector expertise with a personalized approach. Our team has hands-on industry experience, we maintain an extensive network of pre-screened candidates, and we focus on cultural fit alongside technical skills to ensure long-term success."
  },
  {
    question: "How do you ensure candidate quality?",
    answer: "All candidates undergo a comprehensive screening process including skills assessment, background verification, and in-depth interviews. We also maintain ongoing relationships with our talent pool to understand their career progression and goals."
  },
  {
    question: "What are your fees for recruitment services?",
    answer: "Our fees are competitive and based on successful placements only. We offer flexible terms including rebate periods and volume discounts for multiple hires. Contact us for a detailed fee structure tailored to your requirements."
  },
  {
    question: "How quickly can you present candidates?",
    answer: "For most roles, we can present an initial shortlist of qualified candidates within 5-7 business days. For specialized or senior positions, this may extend to 10-14 days to ensure we find the right fit."
  },
  {
    question: "Do you offer replacement guarantees?",
    answer: "Yes, we provide a comprehensive replacement guarantee. If a placed candidate leaves within the agreed period, we will replace them at no additional cost, subject to our terms and conditions."
  }
];