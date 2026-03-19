import { PageScaffold } from '@/components/PageScaffold';
import { Card, CardContent } from '@/components/ui/card';
import { Users, Target, Award } from 'lucide-react';

export default function About() {
  return (
    <div className="container max-w-4xl py-12">
      <PageScaffold title="About UpgraderCX" description="Our mission is to make premium digital services accessible to everyone.">
        <div className="prose max-w-none text-muted-foreground">
          <p>UpgraderCX was founded with a simple goal: provide fast, reliable, and affordable digital services to businesses and individuals worldwide.</p>
        </div>
        <div className="grid gap-6 sm:grid-cols-3">
          {[
            { icon: Target, title: 'Our Mission', desc: 'Democratize access to premium digital tools and services.' },
            { icon: Users, title: 'Our Team', desc: 'A global team of engineers, support staff, and product experts.' },
            { icon: Award, title: 'Our Values', desc: 'Transparency, security, and customer satisfaction above all.' },
          ].map((item) => (
            <Card key={item.title}>
              <CardContent className="pt-6 text-center">
                <item.icon className="mx-auto h-10 w-10 text-primary" />
                <h3 className="mt-3 font-semibold text-foreground">{item.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{item.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </PageScaffold>
    </div>
  );
}
