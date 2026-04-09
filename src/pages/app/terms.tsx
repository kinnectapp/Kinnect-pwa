import React from "react";
import { ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Logo } from "@/components/layout/logo";

const TermsPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#F5F5F7] pb-8">
      <div className="bg-white px-4 py-4">
        <div className=" flex justify-between items-center">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-[#ECE8F1]"
          >
            <ChevronLeft size={18} className="text-[#5A2B8D]" />
          </button>

          <Logo />

          <div className="w-9" />
        </div>
      </div>

      <div className="bg-gradient-to-r from-[#450f77] via-[#65195c70] to-[#7e016b] px-6 py-7 text-center">
        <h1 className="text-[28px] font-semibold leading-[1.1] text-white">
          Terms & Conditions
        </h1>
      </div>

      <div className="space-y-6 px-4 pt-6 text-[14px] pb-14 leading-[1.55] text-[#1C1C1C]">
        <section>
          <h2 className="mb-3 text-[16px] font-semibold">Introduction:</h2>
          <p>
            Welcome to the Kinnect matchmaking App. These Terms & Conditions
            govern your use of our Mobile Application, Website, and Community,
            collectively referred to as the Kinnect Matchmaking Platform. By
            accessing and using our services, you agree to comply with these
            Terms & Conditions. If you disagree with any part, please refrain
            from using our services.
          </p>
          <p className="mt-4">
            You must be at least 18 years old to use our services. By using our
            services, you confirm that you are of legal age.
          </p>
          <p className="mt-4">
            Our platform utilizes cookies. By agreeing to these Terms &
            Conditions, you consent to our use of cookies in accordance with our
            Privacy Policy and Cookies Policy.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-[16px] font-semibold">
            Definition of Terms:
          </h2>
          <p>- Kinnect is referred to as "Us", "We," and "Our."</p>
          <p>- The user is referred to as "User," "You," and "Member."</p>
        </section>

        <section>
          <h2 className="mb-3 text-[16px] font-semibold">Use of Services:</h2>
          <p>Kinnect consists of three main components:</p>
          <p>1. The Matchmaking Service</p>
          <p>2. The Community</p>
          <p>3. The Website</p>
          <p className="mt-4">
            Upon free registration, users can opt to become paid subscribers or
            remain free users with limited access. Free users can be matched but
            cannot chat with their matches. Only paid users will be able to
            continue chatting with their matches.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-[16px] font-semibold">Code of Conduct:</h2>
          <p>
            Users must adhere to applicable laws and regulations, refraining
            from activities such as solicitation, impersonation, and posting
            inappropriate content. Kinnect reserves the right to monitor and
            remove content and users violating these guidelines. These actions
            will be taken without recourse.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-[16px] font-semibold">Paid Features:</h2>
          <p>
            Users may purchase a paid membership pending approval. Kinnect
            reserves the right to change service costs without notice.
            Dissatisfied users are encouraged to opt for other available payment
            plans.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-[16px] font-semibold">Automatic Renewal:</h2>
          <p>
            Paid memberships automatically renew, and users can cancel up to 24
            hours before renewal.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-[16px] font-semibold">
            Cancellation Policies:
          </h2>
          <p>
            Members can cancel subscriptions at any time, with termination
            taking effect on the subscription expiry date.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-[16px] font-semibold">
            Termination of Usage:
          </h2>
          <p>- Members may cancel subscriptions.</p>
          <p>
            - Kinnect may terminate accounts for serious breaches without
            notice.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-[16px] font-semibold">Disclaimers:</h2>
          <p>
            Users acknowledge and agree to use our services at their own
            discretion. Kinnect makes no guarantees regarding matches or
            individual behavior.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-[16px] font-semibold">
            Limitation of Liability:
          </h2>
          <p>
            Kinnect and related parties are not liable for incidental or
            consequential damages. While we ensure utmost safety and identity of
            members using our robust AI and partnership with Veif, users are
            ultimately responsible for their safety.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-[16px] font-semibold">Indemnity:</h2>
          <p>
            Kinnect is hereby indemnified by users against third party claims
            related to their own breach of this agreement or use of services.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-[16px] font-semibold">
            Terms & Conditions – Updates and Amendments:
          </h2>
          <p>
            Kinnect may update these Terms & Conditions, and users are deemed to
            accept the changes by continuing to use the services.
          </p>
        </section>
      </div>
    </div>
  );
};

export default TermsPage;
