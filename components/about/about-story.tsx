
"use client";

import { motion } from "framer-motion";
import Image from "next/image";

const AboutStory = () => {
  return (
    <section className="py-20 bg-gradient-to-br from-white via-gray-50 to-white">
      <div className="section-container">
        {/* Main Story */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-20">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <div className="inline-block bg-gradient-to-r from-primary/10 to-secondary/10 rounded-full px-6 py-2 mb-6">
              <span className="text-primary font-semibold">📖 Our Journey</span>
            </div>
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              From Infrastructure to Innovation
            </h2>
            <div className="space-y-4 text-gray-700 leading-relaxed text-lg">
              <p>
                <span className="font-semibold text-primary">Founded in 2020,</span> CDM Suite brings together complementary expertise spanning infrastructure management, operations excellence, financial planning, and technical project controls. Our leadership team combines experience from $5.1 billion and $4.2 billion airport terminal development programs at LaGuardia and JFK with proven operations management delivering 120%+ profit growth and $2.4M+ in sales across finance, logistics, and marketing sectors.
              </p>
              <p>
                This unique blend of infrastructure rigor and business development expertise allows us to deliver digital solutions with both technical precision and strategic financial oversight. Whether coordinating multi-phase construction programs or leading sales teams to exceed targets, we apply the same fundamentals: clear communication, systematic planning, risk mitigation, and stakeholder management.
              </p>
              <p>
                Today, our portfolio includes logistics websites like <span className="font-semibold text-secondary">rapidoshippinja.com</span>, 
                custom web applications at <span className="font-semibold text-secondary">melissa.cdmsuite.com</span>, and 
                professional branding work for clients across industries. We bring infrastructure-grade project 
                management combined with sales excellence and operations optimization to every solution we create.
              </p>
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="relative aspect-square rounded-2xl overflow-hidden shadow-2xl">
              <Image
                src="https://i.ytimg.com/vi/94mnAH1luXY/maxresdefault.jpg"
                alt="CDM Suite team collaborating"
                fill
                className="object-cover"
              />
            </div>
            {/* Floating stat cards */}
            <div className="absolute -bottom-6 -left-6 bg-gradient-to-r from-accent to-secondary p-6 rounded-xl shadow-xl max-w-[200px]">
              <p className="text-3xl font-bold text-charcoal mb-1">$9.3B+</p>
              <p className="text-charcoal font-medium">Infrastructure Programs</p>
            </div>
            <div className="absolute -top-6 -right-6 bg-white p-6 rounded-xl shadow-xl max-w-[200px]">
              <p className="text-3xl font-bold text-primary mb-1">$2.4M+</p>
              <p className="text-gray-700 font-medium">Sales Achieved</p>
            </div>
          </motion.div>
        </div>

        {/* Our Philosophy */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5 p-12 rounded-2xl"
        >
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">
              What Sets CDM Suite Apart
            </h3>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Our unique background in complex infrastructure gives us an edge in digital delivery:
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white p-8 rounded-xl shadow-lg">
              <div className="text-4xl mb-4">🏗️</div>
              <h4 className="text-xl font-bold text-gray-900 mb-3">Infrastructure-Grade Project Management</h4>
              <p className="text-gray-600 leading-relaxed">
                Experience from $5.1B LaGuardia Terminal B and $4.2B JFK Terminal 6 development programs. 
                We apply the same systematic planning, risk identification, and execution standards to 
                every digital project.
              </p>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-lg">
              <div className="text-4xl mb-4">💼</div>
              <h4 className="text-xl font-bold text-gray-900 mb-3">Sales & Financial Expertise</h4>
              <p className="text-gray-600 leading-relaxed">
                OLT & Equity Licensed financial consultant with $2.4M+ in documented sales across finance, 
                logistics, and marketing. Proven track record building professional networks and delivering 
                tailored wealth management solutions.
              </p>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-lg">
              <div className="text-4xl mb-4">📈</div>
              <h4 className="text-xl font-bold text-gray-900 mb-3">Operations Management Excellence</h4>
              <p className="text-gray-600 leading-relaxed">
                Experience managing 50+ person teams and $250M+ in operations assets with 120%+ profit growth. 
                Expertise in recruitment, training, performance management, and process optimization at scale.
              </p>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-lg">
              <div className="text-4xl mb-4">⚡</div>
              <h4 className="text-xl font-bold text-gray-900 mb-3">Modern Tech with Proven Discipline</h4>
              <p className="text-gray-600 leading-relaxed">
                React, Next.js, TypeScript, and AWS cloud infrastructure combined with CPM scheduling, 
                BIM certification, and Oracle Primavera expertise. The best of both worlds.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Our Commitment */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="mt-20 text-center bg-gradient-to-r from-primary to-charcoal p-12 rounded-2xl text-white"
        >
          <h3 className="text-3xl font-bold mb-6">Our Commitment</h3>
          <p className="text-xl leading-relaxed max-w-3xl mx-auto mb-8">
            We bring the same commitment to excellence and professional standards that guided landmark 
            infrastructure projects to every digital solution we create. Clear communication, systematic 
            planning, risk mitigation, and reliable delivery aren't just buzzwords—they're the 
            foundation of how we work.
          </p>
          <div className="flex flex-wrap justify-center gap-6 text-center">
            <div>
              <p className="text-2xl font-bold text-accent mb-1">Professional</p>
              <p className="text-white/90">Communication Standards</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-accent mb-1">Proven</p>
              <p className="text-white/90">Project Management</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-accent mb-1">Reliable</p>
              <p className="text-white/90">Delivery Excellence</p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default AboutStory;
