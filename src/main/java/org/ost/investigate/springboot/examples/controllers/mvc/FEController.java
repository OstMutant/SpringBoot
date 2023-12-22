package org.ost.investigate.springboot.examples.controllers.mvc;

import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.ost.investigate.springboot.examples.r2dbc.repo.MessageRepository;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

@Slf4j
@Controller
@AllArgsConstructor
public class FEController {

    private final MessageRepository messageRepository;

    @GetMapping("/")
    public String index(Model model) {
        log.info("index");
        model.addAttribute("eventName", "FIFA 2018");
        return "index";
    }
}
