import React from "react";
import InformationCard from "./InformationCard";
import { faHeartPulse, faTruckMedical, faTooth ,faBiohazard} from "@fortawesome/free-solid-svg-icons";
import "../Styles/Info.css";

function Info() {
  return (
    <div className="info-section" id="services">
      <div className="info-title-content">
        <h3 className="info-title">
          {/* <span>What We Do</span> */}
          <span>ما الخدات التي نقدمها</span>

        </h3>
        <p className="info-description">
          {/* We bring healthcare to your convenience, offering a comprehensive
          range of on-demand medical services tailored to your needs. Our
          platform allows you to connect with experienced online doctors who
          provide expert medical advice, issue online prescriptions, and offer
          quick refills whenever you require them. */}
        ‏نحن نقدم الرعاية الصحية لراحتك ، ونقدم مجموعة شاملة من الخدمات الطبية الخاصة بأنواع مختلفة من مرض السرطان عند الطلب والمصممة خصيصا لاحتياجاتك. تتيح لك منصتنا التواصل مع الأطباء ذوي الخبرة عبر الإنترنت الذين يقدمون مشورة طبية متخصصة ، ويصدرون الوصفات الطبية عبر الإنترنت         </p>
      </div>

      <div className="info-cards-content ">
        <InformationCard
          title="حالة الطوارئ"
          description="تم تصميم خدمة رعاية الطوارئ لدينا لتكون دعمك الموثوق به في المواقف الحرجة. سواء كان مرضا مفاجئا أو إصابة أو أي قلق طبي يتطلب عناية فورية ، فإن فريقنا من المتخصصين في الرعاية الصحية المتفانين متاح 24/7 لتقديم رعاية سريعة وفعالة.."
          icon={faTruckMedical}
        />

        <InformationCard
          title="أمراض السرطان"
          description="‏يستخدم فريقنا من أطباء السرطان والخبراء الطبيين ذوي الخبرة أحدث التقنيات لتقييم انواع السرطان المختلفة   وتصميم خطط علاج مخصصة. من الفحوصات الشاملة إلى التدخلات المتقدمة ، نحن ملتزمون بمساعدتك في الحفاظ على صحة جسمك وعيش حياة مرضية.‏."
          icon={faBiohazard}
        />

        {/* <InformationCard
          title="Dental Care"
          description="Smile with confidence as our Dental Care services cater to all your
            oral health needs. Our skilled dentists provide a wide range of
            treatments, from routine check-ups and cleanings to cosmetic
            procedures and restorative treatments."
          icon={faTooth}
        /> */}
      </div>
    </div>
  );
}

export default Info;
