import { useSeo } from "../lib/useSeo";

const Contact = () => {
  useSeo({
    title: "Contact ASIKA | Customer Support",
    description:
      "Get in touch with ASIKA for order support, product questions, and customer assistance.",
    path: "/contact",
  });

  return (
    <div style={{ padding: "120px 20px", textAlign: "center" }}>
      <h1>Contact Us</h1>

      <p>Email: support@asika.com</p>
      <p>Phone: +234 xxx xxx xxxx</p>
      <p>Location: Abuja, Nigeria</p>
    </div>
  );
};

export default Contact;
