package com.gossip.entity;

import jakarta.persistence.Embeddable;

@Embeddable
public class Applicant {

    private String profileName;
    private String whatsappNumber;

    public Applicant() {
    }

    public Applicant(String profileName, String whatsappNumber) {
        this.profileName = profileName;
        this.whatsappNumber = whatsappNumber;
    }

    public String getProfileName() {
        return profileName;
    }

    public void setProfileName(String profileName) {
        this.profileName = profileName;
    }

    public String getWhatsappNumber() {
        return whatsappNumber;
    }

    public void setWhatsappNumber(String whatsappNumber) {
        this.whatsappNumber = whatsappNumber;
    }
}
