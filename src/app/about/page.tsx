import Header from '@/components/layout/header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User, Rocket, Cpu, Award, Users, BookOpen } from 'lucide-react';
import Image from 'next/image';

const teamMembers = [
    {
        name: 'Tejas',
        role: 'Team Leader | Technical Lead & Documentation',
        image: 'https://picsum.photos/seed/tejas/200/200',
        imageHint: 'leader portrait',
        description: 'As our Team Leader, Tejas provides the vision and direction for the project. He also serves as the Technical Lead, architecting the core image processing technology and meticulously handling all project documentation to ensure our work is clear and reproducible.',
        icon: <User className="h-8 w-8 text-primary" />,
    },
    {
        name: 'Atharva',
        role: 'Research & Development (R&D)',
        image: 'https://picsum.photos/seed/atharva/200/200',
        imageHint: 'researcher portrait',
        description: 'Atharva is at the forefront of our innovation. He leads our research efforts, exploring cutting-edge methodologies and scientific principles to continuously improve the accuracy and efficiency of our detection algorithms.',
        icon: <Rocket className="h-8 w-8 text-primary" />,
    },
    {
        name: 'Deep',
        role: 'Research & Development (R&D)',
        image: 'https://picsum.photos/seed/deep/200/200',
        imageHint: 'developer portrait',
        description: 'Working alongside Atharva, Deep is crucial to the practical application of our research. He focuses on implementing, testing, and refining the technology, ensuring our models are robust and effective in real-world scenarios.',
        icon: <Cpu className="h-8 w-8 text-primary" />,
    },
];

const facultyMembers = [
    {
        name: 'Dr. Rajesh K. Behra',
        role: 'Project Head',
        icon: <Award className="h-6 w-6 text-foreground" />,
    },
    {
        name: 'Prof. Swapnil M. Kondawar',
        role: 'Project Co-Ordinator',
        icon: <Users className="h-6 w-6 text-foreground" />,
    },
    {
        name: 'Prof. Nikhil Khatekar',
        role: 'Project Guide',
        icon: <BookOpen className="h-6 w-6 text-foreground" />,
    },
];

export default function AboutPage() {
    return (
        <div className="flex flex-col min-h-screen bg-background">
            <Header />
            <main className="flex-1 container mx-auto p-4 sm:p-6 md:p-8">
                <div className="max-w-4xl mx-auto">
                    <section className="text-center mb-16">
                        <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
                            About Us: APSIT TEAM 1
                        </h1>
                        <p className="mt-6 text-lg leading-8 text-muted-foreground">
                            We are APSIT TEAM 1, a dedicated group of innovators committed to tackling one of the world's most pressing environmental issues: microplastic pollution. Our project harnesses the power of advanced image processing to create an accessible and efficient tool for detecting microplastics in water.
                        </p>
                         <p className="mt-4 text-lg leading-8 text-muted-foreground">
                            Our mission is to provide researchers, environmental agencies, and the public with a reliable method to monitor and analyze water quality, contributing to a cleaner and healthier planet for future generations.
                        </p>
                    </section>

                    <section className="mb-16">
                        <h2 className="text-3xl font-bold text-center mb-8 text-foreground">
                            Meet Our Team
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {teamMembers.map((member) => (
                                <Card key={member.name} className="flex flex-col text-center items-center transform hover:-translate-y-1 transition-all duration-300">
                                    <CardHeader className="items-center">
                                         <Avatar className="h-24 w-24 mb-4 border-4 border-primary/20">
                                            <AvatarImage
                                                src={member.image}
                                                alt={`Portrait of ${member.name}`}
                                                className="object-cover"
                                                data-ai-hint={member.imageHint}
                                            />
                                            <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                        <CardTitle className="text-xl">{member.name}</CardTitle>
                                        <CardDescription className="text-primary font-semibold">{member.role}</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-muted-foreground text-sm">{member.description}</p>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </section>

                    <section className="mb-12">
                        <h2 className="text-3xl font-bold text-center mb-8 text-foreground">
                            Meet Our Faculty
                        </h2>
                        <p className="text-center text-muted-foreground mb-10 max-w-2xl mx-auto">
                            This project is undertaken under the esteemed supervision and guidance of the following faculty members. Their leadership and expertise are instrumental in steering the project towards its objectives.
                        </p>
                        <div className="max-w-md mx-auto space-y-8">
                            {facultyMembers.map((faculty) => (
                                <div key={faculty.name} className="grid grid-cols-[auto_1fr] items-start gap-4">
                                    <div className="flex justify-center items-center h-full">
                                        {faculty.icon}
                                    </div>
                                    <div>
                                        <p className="text-lg font-semibold text-foreground">{faculty.name}</p>
                                        <p className="text-md text-muted-foreground">{faculty.role}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    <section className="text-center mt-16">
                        <p className="text-xl font-semibold italic text-foreground/80">"Continuously Improving Analysis, For Better Precision"</p>
                    </section>
                </div>
            </main>
        </div>
    );
}