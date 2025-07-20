
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, MessageSquare } from "lucide-react";

const FeatureTalentContactButtons = () => {
  return (
    <div className="flex flex-col sm:flex-row gap-4 justify-center">
      <Button asChild size="lg" className="bg-accent hover:bg-accent/90">
        <Link to="/contact">
          <MessageSquare className="mr-2 h-5 w-5" />
          Contact Our Team
        </Link>
      </Button>
      <Button asChild variant="outline" size="lg">
        <Link to="/employers">
          Submit Job Brief
          <ArrowRight className="ml-2 h-5 w-5" />
        </Link>
      </Button>
    </div>
  );
};

export default FeatureTalentContactButtons;
