package org.ost.investigate.springboot.examples.controller;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

@Slf4j
@Controller
public class WebController {
    @GetMapping(value = "/")
    public String index(Model model) {
        model.addAttribute("name", "Ost");
        return "index";
    }
}
