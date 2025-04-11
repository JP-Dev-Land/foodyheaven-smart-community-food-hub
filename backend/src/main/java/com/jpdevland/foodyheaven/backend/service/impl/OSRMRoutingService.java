package com.jpdevland.foodyheaven.backend.service.impl;

import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.util.List;

@Service
public class OSRMRoutingService {

    private final RestTemplate restTemplate;

    public OSRMRoutingService() {
        this.restTemplate = new RestTemplate();
    }

    public RouteResponse getRoute(double originLat, double originLng, double destinationLat, double destinationLng) {
        String url = UriComponentsBuilder.fromUriString("http://router.project-osrm.org/route/v1/driving/{origin};{destination}")
                .queryParam("overview", "full")
                .queryParam("geometries", "geojson")
                .buildAndExpand(originLng + "," + originLat, destinationLng + "," + destinationLat)
                .toUriString();

        return restTemplate.getForObject(url, RouteResponse.class);
    }

    public static class RouteResponse {
        private List<Route> routes;

        public List<Route> getRoutes() {
            return routes;
        }

        public void setRoutes(List<Route> routes) {
            this.routes = routes;
        }
    }

    public static class Route {
        private Geometry geometry;
        private double distance;
        private double duration;

        public Geometry getGeometry() {
            return geometry;
        }

        public void setGeometry(Geometry geometry) {
            this.geometry = geometry;
        }

        public double getDistance() {
            return distance;
        }

        public void setDistance(double distance) {
            this.distance = distance;
        }

        public double getDuration() {
            return duration;
        }

        public void setDuration(double duration) {
            this.duration = duration;
        }
    }

    public static class Geometry {
        private List<List<Double>> coordinates;

        public List<List<Double>> getCoordinates() {
            return coordinates;
        }

        public void setCoordinates(List<List<Double>> coordinates) {
            this.coordinates = coordinates;
        }
    }
}