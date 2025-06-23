package com.gossip.dto;

public class ApplicantDTO {
    private String profileName;
    private String whatsappNumber;

    public ApplicantDTO(String profileName, String whatsappNumber) {
        this.profileName = profileName;
        this.whatsappNumber = whatsappNumber;
    }

    // getters & setters
    public String getProfileName() { return profileName; }
    public void setProfileName(String profileName) { this.profileName = profileName; }
    public String getWhatsappNumber() { return whatsappNumber; }
    public void setWhatsappNumber(String whatsappNumber) { this.whatsappNumber = whatsappNumber; }
}
