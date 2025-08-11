import ContactForm from "@/components/client/contact-form";

export default async function TermsPage() {
    return (
        <div className="container mx-auto p-4 sm:p-6 max-w-lg">
            <h1 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-center">お問い合わせ</h1>
            <ContactForm/>
        </div>
    );
}