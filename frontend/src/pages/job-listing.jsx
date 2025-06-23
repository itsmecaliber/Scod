import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

const JobListing = () => {
  const [form, setForm] = useState({
    orgName: "",
    orgDetails: "",
    ownerName: "",
    phone: "",
    game: "",
    playersNeeded: "",
    perks: "",
  });

  const handleChange = (field) => (e) => {
    setForm({ ...form, [field]: e.target.value });
  };

  const handlePlayerSelect = (value) => {
    setForm({ ...form, playersNeeded: value });
  };

  const handleSubmit = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch("http://localhost:8080/api/jobs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          orgName: form.orgName,
          orgDetails: form.orgDetails,
          ownerName: form.ownerName,
          phone: form.phone,
          game: form.game,
          playersNeeded: form.playersNeeded,
          perks: form.perks,
        }),
      });

      const data = await response.text();
      if (response.ok) {
        alert("✅ " + data);
        setForm({
          orgName: "",
          orgDetails: "",
          ownerName: "",
          phone: "",
          game: "",
          playersNeeded: "",
          perks: "",
        });
      } else {
        alert("❌ Error: " + data);
      }
    } catch (err) {
      console.error(err);
      alert("❌ Failed to post job.");
    }
  };

  const handleViewJobs = () => {
    alert("Navigate to your existing job posts!");
  };

  return (
    <div className="min-h-screen bg-gray-950 p-16">
      <div className="max-w-6xl mx-auto">
        {/* Large top button */}
        <Link to="/job">
            <Button size="lg" className="w-full mb-8">
              View Existing Job Posts
            </Button>
        </Link>

        <Card className="bg-gray-900 text-white shadow-xl">
          <CardHeader>
            <CardTitle className="text-3xl">Post a Recruitment Job</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Form grid: 3 columns on large screens, 2 on medium, 1 on small */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              <div className="space-y-3">
                <Label htmlFor="orgName">Organization Name</Label>
                <Input id="orgName" value={form.orgName} onChange={handleChange("orgName")} />
              </div>

              <div className="space-y-3">
                <Label htmlFor="ownerName">Organization Owner Name</Label>
                <Input id="ownerName" value={form.ownerName} onChange={handleChange("ownerName")} />
              </div>

              <div className="space-y-3">
                <Label htmlFor="phone">Phone Number</Label>
                <Input id="phone" type="tel" value={form.phone} onChange={handleChange("phone")} />
              </div>

              <div className="space-y-3 sm:col-span-2 lg:col-span-1">
                <Label htmlFor="game">Game Recruiting For</Label>
                <Input id="game" value={form.game} onChange={handleChange("game")} />
              </div>

              <div className="space-y-3 sm:col-span-1 lg:col-span-1">
                <Label>Number of Players Needed</Label>
                <Select value={form.playersNeeded} onValueChange={handlePlayerSelect}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select 1 to 4 players" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 - Solo</SelectItem>
                    <SelectItem value="2">2 - Duo</SelectItem>
                    <SelectItem value="3">3 - Trio</SelectItem>
                    <SelectItem value="4">4 - Full Squad</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* orgDetails and perks as textarea spanning 2 columns for better space */}
              <div className="space-y-3 sm:col-span-2 lg:col-span-2">
                <Label htmlFor="orgDetails">Looking For / Skills Required</Label>
                <Textarea id="orgDetails" value={form.orgDetails} onChange={handleChange("orgDetails")} rows={3} />
              </div>

              <div className="space-y-3 sm:col-span-2 lg:col-span-2">
                <Label htmlFor="perks">Perks</Label>
                <Textarea id="perks" value={form.perks} onChange={handleChange("perks")} rows={3} />
              </div>
            </div>

            <Button className="w-full mt-8" onClick={handleSubmit}>
              Post Job
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default JobListing;
